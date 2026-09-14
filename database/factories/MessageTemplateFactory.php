<?php

namespace Database\Factories;

use App\Enums\CommunicationChannel;
use App\Models\MessageTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MessageTemplate>
 */
class MessageTemplateFactory extends Factory
{
    protected $model = MessageTemplate::class;

    public function definition(): array
    {
        $channel = fake()->randomElement(CommunicationChannel::cases());

        return [
            'name' => fake()->words(3, true),
            'channel' => $channel,
            'subject' => $channel === CommunicationChannel::Email ? fake()->sentence() : null,
            'body' => fake()->paragraph(),
            'variables' => ['nome', 'data', 'ora'],
            'is_active' => true,
        ];
    }

    public function sms(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => CommunicationChannel::Sms,
            'subject' => null,
        ]);
    }

    public function email(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => CommunicationChannel::Email,
            'subject' => fake()->sentence(),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
