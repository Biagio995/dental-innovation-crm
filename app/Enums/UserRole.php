<?php

namespace App\Enums;

enum UserRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Operator = 'operator';

    public function canDelete(): bool
    {
        return match ($this) {
            self::Owner, self::Admin => true,
            self::Operator => false,
        };
    }

    public function isPrivileged(): bool
    {
        return match ($this) {
            self::Owner, self::Admin => true,
            self::Operator => false,
        };
    }
}
