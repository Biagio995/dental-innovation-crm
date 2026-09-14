<?php

namespace App\Http\Requests;

use App\Enums\RecallStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecallTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'due_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'string', Rule::enum(RecallStatus::class)],
            'notes' => ['nullable', 'string', 'max:10000'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'resulting_appointment_id' => ['nullable', 'exists:appointments,id'],
        ];
    }
}
