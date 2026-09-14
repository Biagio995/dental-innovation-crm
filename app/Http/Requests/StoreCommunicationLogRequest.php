<?php

namespace App\Http\Requests;

use App\Enums\CommunicationChannel;
use App\Enums\CommunicationStatus;
use App\Enums\ReminderType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommunicationLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'recall_task_id' => ['nullable', 'exists:recall_tasks,id'],
            'message_template_id' => ['nullable', 'exists:message_templates,id'],
            'channel' => ['required', 'string', Rule::enum(CommunicationChannel::class)],
            'status' => ['sometimes', 'string', Rule::enum(CommunicationStatus::class)],
            'recipient' => ['required', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'reminder_type' => ['nullable', 'string', Rule::enum(ReminderType::class)],
            'external_id' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
