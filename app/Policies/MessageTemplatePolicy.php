<?php

namespace App\Policies;

use App\Models\MessageTemplate;
use App\Models\User;

class MessageTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MessageTemplate $template): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isPrivileged();
    }

    public function update(User $user, MessageTemplate $template): bool
    {
        return $user->isPrivileged();
    }

    public function delete(User $user, MessageTemplate $template): bool
    {
        return $user->canDelete();
    }

    public function restore(User $user, MessageTemplate $template): bool
    {
        return $user->canDelete();
    }
}
