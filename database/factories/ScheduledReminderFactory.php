<?php

namespace Database\Factories;

use App\Enums\CommunicationChannel;
use App\Enums\ReminderType;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\ScheduledReminder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ScheduledReminder>
 */
class ScheduledReminderFactory extends Factory
{
    protected $model = ScheduledReminder::class;

    public function definition(): array
    {
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        return [
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'reminder_type' => fake()->randomElement([ReminderType::Appointment24h, ReminderType::Appointment48h]),
            'channel' => fake()->randomElement(CommunicationChannel::cases()),
            'scheduled_for' => $appointment->scheduled_at->subHours(24),
            'is_sent' => false,
            'sent_at' => null,
            'communication_log_id' => null,
        ];
    }

    public function forAppointment(Appointment $appointment): static
    {
        return $this->state(fn (array $attributes) => [
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'scheduled_for' => $appointment->scheduled_at->subHours(24),
        ]);
    }

    public function reminder24h(): static
    {
        return $this->state(fn (array $attributes) => [
            'reminder_type' => ReminderType::Appointment24h,
        ]);
    }

    public function reminder48h(): static
    {
        return $this->state(fn (array $attributes) => [
            'reminder_type' => ReminderType::Appointment48h,
        ]);
    }

    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_sent' => true,
            'sent_at' => now(),
        ]);
    }

    public function due(): static
    {
        return $this->state(fn (array $attributes) => [
            'scheduled_for' => now()->subMinutes(5),
            'is_sent' => false,
        ]);
    }
}
