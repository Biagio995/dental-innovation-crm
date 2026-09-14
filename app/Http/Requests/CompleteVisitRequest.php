<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'treatment_notes' => ['nullable', 'string', 'max:10000'],
            'recommended_recall_date' => ['nullable', 'date', 'after:today'],
        ];
    }
}
