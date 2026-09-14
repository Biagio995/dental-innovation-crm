<?php

namespace App\Http\Requests;

use App\Enums\RecallStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordContactOutcomeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'outcome' => [
                'required',
                'string',
                Rule::in([
                    RecallStatus::Contacted->value,
                    RecallStatus::Scheduled->value,
                    RecallStatus::NoAnswer->value,
                    RecallStatus::Declined->value,
                ]),
            ],
            'notes' => ['nullable', 'string', 'max:10000'],
            'resulting_appointment_id' => [
                'nullable',
                'exists:appointments,id',
                'required_if:outcome,scheduled',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'resulting_appointment_id.required_if' => 'An appointment must be linked when marking the recall as scheduled.',
        ];
    }
}
