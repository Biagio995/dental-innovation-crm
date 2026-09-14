<?php

namespace App\Http\Requests;

use App\Enums\CommunicationChannel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMessageTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'channel' => ['sometimes', 'string', Rule::enum(CommunicationChannel::class)],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['sometimes', 'string', 'max:10000'],
            'variables' => ['nullable', 'array'],
            'variables.*' => ['string', 'max:50'],
            'is_active' => ['boolean'],
        ];
    }
}
