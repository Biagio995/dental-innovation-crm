<?php

namespace App\Http\Requests;

use App\Enums\PatientStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'notes' => ['nullable', 'string', 'max:10000'],
            'consents' => ['nullable', 'array'],
            'consents.marketing' => ['nullable', 'boolean'],
            'consents.data_processing' => ['nullable', 'boolean'],
            'consents.medical_records' => ['nullable', 'boolean'],
            'status' => ['nullable', Rule::enum(PatientStatus::class)],
        ];
    }
}
