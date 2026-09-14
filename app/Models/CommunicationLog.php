<?php

namespace App\Models;

use App\Enums\CommunicationChannel;
use App\Enums\CommunicationStatus;
use App\Enums\ReminderType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunicationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'appointment_id',
        'recall_task_id',
        'message_template_id',
        'channel',
        'status',
        'recipient',
        'subject',
        'body',
        'reminder_type',
        'external_id',
        'error_message',
        'metadata',
        'sent_at',
        'sent_by',
    ];

    protected function casts(): array
    {
        return [
            'channel' => CommunicationChannel::class,
            'status' => CommunicationStatus::class,
            'reminder_type' => ReminderType::class,
            'metadata' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function recallTask(): BelongsTo
    {
        return $this->belongsTo(RecallTask::class);
    }

    public function messageTemplate(): BelongsTo
    {
        return $this->belongsTo(MessageTemplate::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function markAsSent(?string $externalId = null): void
    {
        $this->update([
            'status' => CommunicationStatus::Sent,
            'sent_at' => now(),
            'external_id' => $externalId,
        ]);
    }

    public function markAsDelivered(): void
    {
        $this->update(['status' => CommunicationStatus::Delivered]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => CommunicationStatus::Failed,
            'error_message' => $errorMessage,
        ]);
    }

    public function scopeForPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByChannel($query, CommunicationChannel $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopePending($query)
    {
        return $query->where('status', CommunicationStatus::Queued);
    }
}
