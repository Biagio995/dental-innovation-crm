<?php

namespace App\Services\Messaging;

use App\Enums\CommunicationChannel;
use App\Models\CommunicationLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FakeMessagingDriver implements MessagingDriverInterface
{
    protected bool $shouldFail = false;

    protected ?string $failureMessage = null;

    protected static array $sentMessages = [];

    public function send(CommunicationLog $log): SendResult
    {
        $externalId = 'fake_' . Str::uuid();

        $messageData = [
            'id' => $externalId,
            'channel' => $log->channel->value,
            'recipient' => $log->recipient,
            'subject' => $log->subject,
            'body' => $log->body,
            'sent_at' => now()->toIso8601String(),
        ];

        if ($this->shouldFail) {
            Log::channel('messaging')->warning('FakeMessagingDriver: Simulated failure', [
                'log_id' => $log->id,
                'error' => $this->failureMessage ?? 'Simulated delivery failure',
            ]);

            return SendResult::failure(
                $this->failureMessage ?? 'Simulated delivery failure',
                ['driver' => 'fake']
            );
        }

        static::$sentMessages[] = $messageData;

        Log::channel('messaging')->info('FakeMessagingDriver: Message sent', [
            'log_id' => $log->id,
            'external_id' => $externalId,
            'channel' => $log->channel->value,
            'recipient' => $log->recipient,
        ]);

        return SendResult::success($externalId, [
            'driver' => 'fake',
            'simulated' => true,
        ]);
    }

    public function supports(CommunicationChannel $channel): bool
    {
        return true;
    }

    public function getDriverName(): string
    {
        return 'fake';
    }

    public function shouldFail(bool $fail = true, ?string $message = null): self
    {
        $this->shouldFail = $fail;
        $this->failureMessage = $message;

        return $this;
    }

    public static function getSentMessages(): array
    {
        return static::$sentMessages;
    }

    public static function clearSentMessages(): void
    {
        static::$sentMessages = [];
    }

    public static function getLastMessage(): ?array
    {
        return empty(static::$sentMessages) ? null : end(static::$sentMessages);
    }
}
