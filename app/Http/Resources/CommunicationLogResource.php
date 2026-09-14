<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunicationLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $channel = $this->channel instanceof \App\Enums\CommunicationChannel
            ? $this->channel
            : \App\Enums\CommunicationChannel::tryFrom($this->channel) ?? \App\Enums\CommunicationChannel::Sms;

        $status = $this->status instanceof \App\Enums\CommunicationStatus
            ? $this->status
            : \App\Enums\CommunicationStatus::tryFrom($this->status) ?? \App\Enums\CommunicationStatus::Queued;

        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'patient' => new PatientResource($this->whenLoaded('patient')),
            'appointment_id' => $this->appointment_id,
            'appointment' => new AppointmentResource($this->whenLoaded('appointment')),
            'recall_task_id' => $this->recall_task_id,
            'message_template_id' => $this->message_template_id,
            'channel' => $channel->value,
            'channel_label' => $channel->label(),
            'status' => $status->value,
            'status_label' => $status->label(),
            'recipient' => $this->recipient,
            'subject' => $this->subject,
            'body' => $this->body,
            'reminder_type' => $this->reminder_type?->value,
            'reminder_type_label' => $this->reminder_type?->label(),
            'external_id' => $this->external_id,
            'error_message' => $this->error_message,
            'metadata' => $this->metadata,
            'sent_at' => $this->sent_at?->toIso8601String(),
            'sent_by' => $this->sent_by,
            'sender' => $this->whenLoaded('sender', fn () => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
