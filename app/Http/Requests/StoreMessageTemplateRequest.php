<?php

namespace App\Http\Requests;

use App\Enums\CommunicationChannel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMessageTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'channel' => ['required', 'string', Rule::enum(CommunicationChannel::class)],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'variables' => ['nullable', 'array'],
            'variables.*' => ['string', 'max:50'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'channel.Illuminate\Validation\Rules\Enum' => 'The channel must be sms or email.',
        ];
    }
}
