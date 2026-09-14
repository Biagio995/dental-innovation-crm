<?php

namespace App\Http\Requests;

use App\Enums\CommunicationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCommunicationStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::enum(CommunicationStatus::class)],
            'external_id' => ['nullable', 'string', 'max:255'],
            'error_message' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
