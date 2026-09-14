<?php

namespace App\Services\Messaging;

use App\Enums\CommunicationChannel;
use App\Models\CommunicationLog;

interface MessagingDriverInterface
{
    public function send(CommunicationLog $log): SendResult;

    public function supports(CommunicationChannel $channel): bool;

    public function getDriverName(): string;
}
