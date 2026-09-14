<?php

namespace App\Policies;

use App\Models\CommunicationLog;
use App\Models\User;

class CommunicationLogPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CommunicationLog $log): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CommunicationLog $log): bool
    {
        return true;
    }

    public function delete(User $user, CommunicationLog $log): bool
    {
        return $user->canDelete();
    }
}
