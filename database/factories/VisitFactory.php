<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Visit>
 */
class VisitFactory extends Factory
{
    public function definition(): array
    {
        return [
            'appointment_id' => Appointment::factory(),
            'patient_id' => Patient::factory(),
            'treatment_notes' => fake()->optional()->paragraph(),
            'recommended_recall_date' => fake()->optional()->dateTimeBetween('+3 months', '+12 months'),
        ];
    }

    public function withRecall(): static
    {
        return $this->state(fn (array $attributes) => [
            'recommended_recall_date' => fake()->dateTimeBetween('+3 months', '+6 months'),
        ]);
    }
}
