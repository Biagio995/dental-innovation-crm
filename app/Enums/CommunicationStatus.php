<?php

namespace App\Enums;

enum CommunicationStatus: string
{
    case Queued = 'queued';
    case Sent = 'sent';
    case Delivered = 'delivered';
    case Failed = 'failed';
    case Bounced = 'bounced';

    public function isFinal(): bool
    {
        return match ($this) {
            self::Delivered, self::Failed, self::Bounced => true,
            default => false,
        };
    }

    public function isSuccessful(): bool
    {
        return match ($this) {
            self::Sent, self::Delivered => true,
            default => false,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Queued => 'Queued',
            self::Sent => 'Sent',
            self::Delivered => 'Delivered',
            self::Failed => 'Failed',
            self::Bounced => 'Bounced',
        };
    }
}
