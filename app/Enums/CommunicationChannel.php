<?php

namespace App\Enums;

enum CommunicationChannel: string
{
    case Sms = 'sms';
    case Email = 'email';

    public function label(): string
    {
        return match ($this) {
            self::Sms => 'SMS',
            self::Email => 'Email',
        };
    }
}
