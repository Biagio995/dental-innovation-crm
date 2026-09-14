<?php

namespace App\Models;

use App\Enums\CommunicationChannel;
use App\Enums\ReminderType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduledReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'reminder_type',
        'channel',
        'scheduled_for',
        'is_sent',
        'sent_at',
        'communication_log_id',
    ];

    protected function casts(): array
    {
        return [
            'reminder_type' => ReminderType::class,
            'channel' => CommunicationChannel::class,
            'scheduled_for' => 'datetime',
            'is_sent' => 'boolean',
            'sent_at' => 'datetime',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function communicationLog(): BelongsTo
    {
        return $this->belongsTo(CommunicationLog::class);
    }

    public function markAsSent(CommunicationLog $log): void
    {
        $this->update([
            'is_sent' => true,
            'sent_at' => now(),
            'communication_log_id' => $log->id,
        ]);
    }

    public function scopePending($query)
    {
        return $query->where('is_sent', false);
    }

    public function scopeDue($query)
    {
        return $query->where('is_sent', false)
            ->where('scheduled_for', '<=', now());
    }

    public function scopeForAppointment($query, int $appointmentId)
    {
        return $query->where('appointment_id', $appointmentId);
    }
}
