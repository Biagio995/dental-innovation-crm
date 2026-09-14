<?php

namespace App\Enums;

enum ReminderType: string
{
    case Appointment48h = 'appointment_48h';
    case Appointment24h = 'appointment_24h';
    case PostVisit = 'post_visit';
    case Recall = 'recall';

    public function label(): string
    {
        return match ($this) {
            self::Appointment48h => '48h Before Appointment',
            self::Appointment24h => '24h Before Appointment',
            self::PostVisit => 'Post Visit',
            self::Recall => 'Recall Reminder',
        };
    }

    public function hoursOffset(): ?int
    {
        return match ($this) {
            self::Appointment48h => 48,
            self::Appointment24h => 24,
            default => null,
        };
    }
}
