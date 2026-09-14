<?php

namespace Database\Factories;

use App\Enums\CommunicationChannel;
use App\Enums\CommunicationStatus;
use App\Models\CommunicationLog;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunicationLog>
 */
class CommunicationLogFactory extends Factory
{
    protected $model = CommunicationLog::class;

    public function definition(): array
    {
        $channel = fake()->randomElement(CommunicationChannel::cases());

        return [
            'patient_id' => Patient::factory(),
            'appointment_id' => null,
            'recall_task_id' => null,
            'message_template_id' => null,
            'channel' => $channel,
            'status' => CommunicationStatus::Queued,
            'recipient' => $channel === CommunicationChannel::Email
                ? fake()->email()
                : fake()->phoneNumber(),
            'subject' => $channel === CommunicationChannel::Email ? fake()->sentence() : null,
            'body' => fake()->paragraph(),
            'reminder_type' => null,
            'external_id' => null,
            'error_message' => null,
            'metadata' => null,
            'sent_at' => null,
            'sent_by' => null,
        ];
    }

    public function sms(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => CommunicationChannel::Sms,
            'recipient' => fake()->phoneNumber(),
            'subject' => null,
        ]);
    }

    public function email(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => CommunicationChannel::Email,
            'recipient' => fake()->email(),
            'subject' => fake()->sentence(),
        ]);
    }

    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CommunicationStatus::Sent,
            'sent_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'external_id' => 'ext_' . fake()->uuid(),
        ]);
    }

    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CommunicationStatus::Delivered,
            'sent_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'external_id' => 'ext_' . fake()->uuid(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CommunicationStatus::Failed,
            'error_message' => fake()->sentence(),
        ]);
    }
}
