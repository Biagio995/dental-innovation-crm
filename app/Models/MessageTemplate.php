<?php

namespace App\Models;

use App\Enums\CommunicationChannel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MessageTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'channel',
        'subject',
        'body',
        'variables',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'channel' => CommunicationChannel::class,
            'variables' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function communicationLogs(): HasMany
    {
        return $this->hasMany(CommunicationLog::class);
    }

    public function render(array $data): array
    {
        $subject = $this->subject;
        $body = $this->body;

        foreach ($data as $key => $value) {
            $placeholder = '{' . $key . '}';
            if ($subject) {
                $subject = str_replace($placeholder, (string) $value, $subject);
            }
            $body = str_replace($placeholder, (string) $value, $body);
        }

        return [
            'subject' => $subject,
            'body' => $body,
        ];
    }

    public function extractVariables(): array
    {
        $content = ($this->subject ?? '') . ' ' . $this->body;
        preg_match_all('/\{([a-z_]+)\}/', $content, $matches);

        return array_unique($matches[1] ?? []);
    }
}
