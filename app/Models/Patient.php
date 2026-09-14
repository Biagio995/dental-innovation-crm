<?php

namespace App\Models;

use App\Enums\PatientStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'notes',
        'consents',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'consents' => 'array',
            'status' => PatientStatus::class,
        ];
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }

    public function recallTasks(): HasMany
    {
        return $this->hasMany(RecallTask::class);
    }

    public function communicationLogs(): HasMany
    {
        return $this->hasMany(CommunicationLog::class);
    }

    public function scheduledReminders(): HasMany
    {
        return $this->hasMany(ScheduledReminder::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getLatestRecallDateAttribute(): ?\Carbon\Carbon
    {
        return $this->visits()
            ->whereNotNull('recommended_recall_date')
            ->orderByDesc('recommended_recall_date')
            ->value('recommended_recall_date');
    }
}
