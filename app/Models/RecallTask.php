<?php

namespace App\Models;

use App\Enums\RecallStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecallTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'visit_id',
        'due_date',
        'status',
        'notes',
        'contact_attempts',
        'last_contact_at',
        'created_by',
        'assigned_to',
        'resulting_appointment_id',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'status' => RecallStatus::class,
            'contact_attempts' => 'integer',
            'last_contact_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function resultingAppointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'resulting_appointment_id');
    }

    public function communicationLogs(): HasMany
    {
        return $this->hasMany(CommunicationLog::class);
    }

    public function recordContactAttempt(): void
    {
        $this->increment('contact_attempts');
        $this->update(['last_contact_at' => now()]);
    }

    public function isOverdue(): bool
    {
        return $this->due_date->isPast() && ! $this->status->isFinal();
    }

    public function scopePending($query)
    {
        return $query->where('status', RecallStatus::Pending);
    }

    public function scopeDue($query)
    {
        return $query->whereIn('status', [RecallStatus::Pending, RecallStatus::Contacted, RecallStatus::NoAnswer])
            ->where('due_date', '<=', now()->toDateString());
    }

    public function scopeUpcoming($query, int $days = 7)
    {
        return $query->whereIn('status', [RecallStatus::Pending, RecallStatus::Contacted, RecallStatus::NoAnswer])
            ->whereBetween('due_date', [now()->toDateString(), now()->addDays($days)->toDateString()]);
    }
}
