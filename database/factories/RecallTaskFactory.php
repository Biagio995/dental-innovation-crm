<?php

namespace Database\Factories;

use App\Enums\RecallStatus;
use App\Models\Patient;
use App\Models\RecallTask;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecallTask>
 */
class RecallTaskFactory extends Factory
{
    protected $model = RecallTask::class;

    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'visit_id' => null,
            'due_date' => fake()->dateTimeBetween('now', '+6 months'),
            'status' => RecallStatus::Pending,
            'notes' => fake()->optional()->sentence(),
            'contact_attempts' => 0,
            'last_contact_at' => null,
            'created_by' => null,
            'assigned_to' => null,
            'resulting_appointment_id' => null,
        ];
    }

    public function forVisit(Visit $visit): static
    {
        return $this->state(fn (array $attributes) => [
            'patient_id' => $visit->patient_id,
            'visit_id' => $visit->id,
            'due_date' => $visit->recommended_recall_date ?? now()->addMonths(6),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RecallStatus::Pending,
        ]);
    }

    public function contacted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RecallStatus::Contacted,
            'contact_attempts' => fake()->numberBetween(1, 3),
            'last_contact_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RecallStatus::Scheduled,
            'contact_attempts' => fake()->numberBetween(1, 5),
            'last_contact_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => fake()->dateTimeBetween('-30 days', '-1 day'),
            'status' => RecallStatus::Pending,
        ]);
    }

    public function dueToday(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => now()->toDateString(),
            'status' => RecallStatus::Pending,
        ]);
    }
}
