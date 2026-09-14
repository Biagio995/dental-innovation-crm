<?php

namespace App\Console\Commands;

use App\Enums\AppointmentStatus;
use App\Enums\CommunicationChannel;
use App\Enums\ReminderType;
use App\Models\Appointment;
use App\Models\ScheduledReminder;
use Illuminate\Console\Command;

class ScheduleAppointmentReminders extends Command
{
    protected $signature = 'reminders:schedule
                            {--hours=72 : Schedule reminders for appointments within this many hours}
                            {--channels=sms,email : Comma-separated list of channels to use}';

    protected $description = 'Schedule appointment reminders (24h and 48h before appointments)';

    public function handle(): int
    {
        $hours = (int) $this->option('hours');
        $channels = array_map('trim', explode(',', $this->option('channels')));

        $this->info("Scheduling reminders for appointments in the next {$hours} hours...");

        $appointments = Appointment::with('patient')
            ->whereIn('status', [AppointmentStatus::Scheduled, AppointmentStatus::Confirmed])
            ->whereBetween('scheduled_at', [now(), now()->addHours($hours)])
            ->get();

        $scheduled = 0;

        foreach ($appointments as $appointment) {
            foreach ($channels as $channelStr) {
                $channel = CommunicationChannel::tryFrom($channelStr);
                if (! $channel) {
                    continue;
                }

                $scheduled += $this->scheduleRemindersForAppointment($appointment, $channel);
            }
        }

        $this->info("Scheduled {$scheduled} new reminders.");

        return Command::SUCCESS;
    }

    protected function scheduleRemindersForAppointment(Appointment $appointment, CommunicationChannel $channel): int
    {
        $scheduled = 0;
        $reminderTypes = [ReminderType::Appointment48h, ReminderType::Appointment24h];

        foreach ($reminderTypes as $type) {
            $hoursOffset = $type->hoursOffset();
            if (! $hoursOffset) {
                continue;
            }

            $scheduledFor = $appointment->scheduled_at->copy()->subHours($hoursOffset);

            if ($scheduledFor->isPast()) {
                continue;
            }

            $exists = ScheduledReminder::where('appointment_id', $appointment->id)
                ->where('reminder_type', $type)
                ->where('channel', $channel)
                ->exists();

            if ($exists) {
                continue;
            }

            ScheduledReminder::create([
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'reminder_type' => $type,
                'channel' => $channel,
                'scheduled_for' => $scheduledFor,
            ]);

            $scheduled++;

            $this->line("  Scheduled {$type->value} {$channel->value} for appointment #{$appointment->id}");
        }

        return $scheduled;
    }
}
