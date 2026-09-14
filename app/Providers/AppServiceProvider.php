<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\CommunicationLog;
use App\Models\MessageTemplate;
use App\Models\Patient;
use App\Models\RecallTask;
use App\Models\Visit;
use App\Policies\AppointmentPolicy;
use App\Policies\CommunicationLogPolicy;
use App\Policies\MessageTemplatePolicy;
use App\Policies\PatientPolicy;
use App\Policies\RecallTaskPolicy;
use App\Policies\VisitPolicy;
use App\Services\Messaging\FakeMessagingDriver;
use App\Services\Messaging\MessagingDriverInterface;
use App\Services\Messaging\MessagingService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MessagingDriverInterface::class, function ($app) {
            return new FakeMessagingDriver();
        });

        $this->app->singleton(MessagingService::class, function ($app) {
            return new MessagingService(
                $app->make(MessagingDriverInterface::class)
            );
        });
    }

    public function boot(): void
    {
        Gate::policy(Patient::class, PatientPolicy::class);
        Gate::policy(Appointment::class, AppointmentPolicy::class);
        Gate::policy(Visit::class, VisitPolicy::class);
        Gate::policy(MessageTemplate::class, MessageTemplatePolicy::class);
        Gate::policy(RecallTask::class, RecallTaskPolicy::class);
        Gate::policy(CommunicationLog::class, CommunicationLogPolicy::class);
    }
}
