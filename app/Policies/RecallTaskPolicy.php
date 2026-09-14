<?php

namespace App\Policies;

use App\Models\RecallTask;
use App\Models\User;

class RecallTaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, RecallTask $task): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, RecallTask $task): bool
    {
        return true;
    }

    public function delete(User $user, RecallTask $task): bool
    {
        return $user->canDelete();
    }

    public function recordOutcome(User $user, RecallTask $task): bool
    {
        return true;
    }
}
