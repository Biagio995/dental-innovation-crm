<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case Scheduled = 'scheduled';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';
    case Completed = 'completed';

    public function isFinal(): bool
    {
        return match ($this) {
            self::Cancelled, self::NoShow, self::Completed => true,
            default => false,
        };
    }
}
