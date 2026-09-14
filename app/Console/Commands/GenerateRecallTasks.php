<?php

namespace App\Console\Commands;

use App\Enums\RecallStatus;
use App\Models\RecallTask;
use App\Models\Visit;
use Illuminate\Console\Command;

class GenerateRecallTasks extends Command
{
    protected $signature = 'recalls:generate
                            {--days=30 : Generate tasks for recalls due within this many days}
                            {--dry-run : Show what would be created without actually creating}';

    protected $description = 'Generate recall tasks from visits with recommended recall dates';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');

        $this->info("Generating recall tasks for the next {$days} days...");

        $visits = Visit::with('patient')
            ->whereNotNull('recommended_recall_date')
            ->whereBetween('recommended_recall_date', [
                now()->toDateString(),
                now()->addDays($days)->toDateString(),
            ])
            ->whereDoesntHave('patient.recallTasks', function ($query) {
                $query->whereIn('status', [
                    RecallStatus::Pending,
                    RecallStatus::Contacted,
                    RecallStatus::NoAnswer,
                    RecallStatus::Scheduled,
                ]);
            })
            ->get();

        if ($visits->isEmpty()) {
            $this->info('No visits found that need recall tasks.');

            return Command::SUCCESS;
        }

        $this->info("Found {$visits->count()} visits needing recall tasks.");

        $created = 0;

        foreach ($visits as $visit) {
            if ($dryRun) {
                $this->line("Would create recall for patient #{$visit->patient_id} due {$visit->recommended_recall_date->toDateString()}");
                $created++;

                continue;
            }

            RecallTask::create([
                'patient_id' => $visit->patient_id,
                'visit_id' => $visit->id,
                'due_date' => $visit->recommended_recall_date,
            ]);

            $this->line("Created recall task for patient #{$visit->patient_id}");
            $created++;
        }

        $action = $dryRun ? 'Would create' : 'Created';
        $this->info("{$action} {$created} recall tasks.");

        return Command::SUCCESS;
    }
}
