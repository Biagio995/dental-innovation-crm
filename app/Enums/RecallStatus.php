<?php

namespace App\Enums;

enum RecallStatus: string
{
    case Pending = 'pending';
    case Contacted = 'contacted';
    case Scheduled = 'scheduled';
    case NoAnswer = 'no_answer';
    case Declined = 'declined';
    case Expired = 'expired';

    public function isFinal(): bool
    {
        return match ($this) {
            self::Scheduled, self::Declined, self::Expired => true,
            default => false,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Contacted => 'Contacted',
            self::Scheduled => 'Scheduled',
            self::NoAnswer => 'No Answer',
            self::Declined => 'Declined',
            self::Expired => 'Expired',
        };
    }
}
