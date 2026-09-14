<?php

namespace App\Services\Messaging;

use App\Enums\CommunicationChannel;
use App\Enums\CommunicationStatus;
use App\Enums\ReminderType;
use App\Models\Appointment;
use App\Models\CommunicationLog;
use App\Models\MessageTemplate;
use App\Models\Patient;
use App\Models\RecallTask;
use Illuminate\Support\Facades\Log;

class MessagingService
{
    public function __construct(
        protected MessagingDriverInterface $driver
    ) {}

    public function send(CommunicationLog $log): SendResult
    {
        $result = $this->driver->send($log);

        if ($result->success) {
            $log->markAsSent($result->externalId);
        } else {
            $log->markAsFailed($result->errorMessage ?? 'Unknown error');
        }

        return $result;
    }

    public function sendFromTemplate(
        MessageTemplate $template,
        Patient $patient,
        array $variables = [],
        ?Appointment $appointment = null,
        ?RecallTask $recallTask = null,
        ?ReminderType $reminderType = null,
        ?int $sentBy = null,
    ): CommunicationLog {
        $rendered = $template->render($variables);

        $recipient = match ($template->channel) {
            CommunicationChannel::Email => $patient->email,
            CommunicationChannel::Sms => $patient->phone,
        };

        if (! $recipient) {
            throw new \InvalidArgumentException(
                "Patient {$patient->id} has no {$template->channel->value} contact information."
            );
        }

        $log = CommunicationLog::create([
            'patient_id' => $patient->id,
            'appointment_id' => $appointment?->id,
            'recall_task_id' => $recallTask?->id,
            'message_template_id' => $template->id,
            'channel' => $template->channel,
            'status' => CommunicationStatus::Queued,
            'recipient' => $recipient,
            'subject' => $rendered['subject'],
            'body' => $rendered['body'],
            'reminder_type' => $reminderType,
            'sent_by' => $sentBy,
            'metadata' => [
                'template_name' => $template->name,
                'variables' => $variables,
            ],
        ]);

        $this->send($log);

        return $log;
    }

    public function sendAppointmentReminder(
        Appointment $appointment,
        ReminderType $reminderType,
        CommunicationChannel $channel,
    ): ?CommunicationLog {
        $patient = $appointment->patient;

        $templateName = match ($reminderType) {
            ReminderType::Appointment48h => $channel === CommunicationChannel::Sms
                ? 'SMS Promemoria 48h'
                : 'Email Promemoria 48h',
            ReminderType::Appointment24h => $channel === CommunicationChannel::Sms
                ? 'SMS Promemoria 24h'
                : 'Email Promemoria 24h',
            default => null,
        };

        if (! $templateName) {
            Log::warning('No template configured for reminder type', [
                'reminder_type' => $reminderType->value,
                'channel' => $channel->value,
            ]);

            return null;
        }

        $template = MessageTemplate::where('name', $templateName)
            ->where('channel', $channel)
            ->where('is_active', true)
            ->first();

        if (! $template) {
            Log::warning('Template not found', ['name' => $templateName]);

            return null;
        }

        $variables = [
            'nome' => $patient->first_name,
            'data' => $appointment->scheduled_at->format('d/m/Y'),
            'ora' => $appointment->scheduled_at->format('H:i'),
            'telefono' => config('app.clinic_phone', '+39 XXX XXX XXXX'),
        ];

        try {
            return $this->sendFromTemplate(
                template: $template,
                patient: $patient,
                variables: $variables,
                appointment: $appointment,
                reminderType: $reminderType,
            );
        } catch (\InvalidArgumentException $e) {
            Log::warning('Cannot send reminder: ' . $e->getMessage(), [
                'appointment_id' => $appointment->id,
                'patient_id' => $patient->id,
            ]);

            return null;
        }
    }

    public function getDriver(): MessagingDriverInterface
    {
        return $this->driver;
    }
}
