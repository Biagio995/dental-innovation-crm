<?php

namespace App\Console\Commands;

use App\Enums\AppointmentStatus;
use App\Models\ScheduledReminder;
use App\Services\Messaging\MessagingService;
use Illuminate\Console\Command;

class ProcessScheduledReminders extends Command
{
    protected $signature = 'reminders:process
                            {--limit=100 : Maximum number of reminders to process}
                            {--dry-run : Show what would be sent without actually sending}';

    protected $description = 'Process and send due scheduled reminders';

    public function __construct(
        protected MessagingService $messagingService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $limit = (int) $this->option('limit');
        $dryRun = $this->option('dry-run');

        $this->info('Processing scheduled reminders...');

        $reminders = ScheduledReminder::with(['appointment.patient', 'patient'])
            ->due()
            ->limit($limit)
            ->get();

        if ($reminders->isEmpty()) {
            $this->info('No reminders to process.');

            return Command::SUCCESS;
        }

        $this->info("Found {$reminders->count()} reminders to process.");

        $sent = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($reminders as $reminder) {
            $appointment = $reminder->appointment;

            if (! $appointment) {
                $this->warn("Skipping reminder #{$reminder->id}: appointment not found");
                $reminder->update(['is_sent' => true]);
                $skipped++;

                continue;
            }

            if ($appointment->status->isFinal()) {
                $this->line("Skipping reminder #{$reminder->id}: appointment is {$appointment->status->value}");
                $reminder->update(['is_sent' => true]);
                $skipped++;

                continue;
            }

            if ($dryRun) {
                $this->line("Would send {$reminder->reminder_type->value} {$reminder->channel->value} to patient #{$reminder->patient_id}");
                $sent++;

                continue;
            }

            $log = $this->messagingService->sendAppointmentReminder(
                $appointment,
                $reminder->reminder_type,
                $reminder->channel
            );

            if ($log) {
                $reminder->markAsSent($log);
                $this->line("Sent reminder #{$reminder->id} -> communication log #{$log->id}");
                $sent++;
            } else {
                $reminder->update(['is_sent' => true]);
                $this->warn("Failed to send reminder #{$reminder->id}");
                $failed++;
            }
        }

        $this->info("Processed: {$sent} sent, {$skipped} skipped, {$failed} failed.");

        return Command::SUCCESS;
    }
}
