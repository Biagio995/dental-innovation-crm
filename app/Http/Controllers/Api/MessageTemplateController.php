<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageTemplateRequest;
use App\Http\Requests\UpdateMessageTemplateRequest;
use App\Http\Resources\MessageTemplateResource;
use App\Models\AuditLog;
use App\Models\MessageTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class MessageTemplateController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', MessageTemplate::class);

        $query = MessageTemplate::query();

        if ($request->has('channel')) {
            $query->where('channel', $request->input('channel'));
        }

        if ($request->boolean('active_only', false)) {
            $query->where('is_active', true);
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%");
            });
        }

        $templates = $query->orderBy('name')
            ->paginate($request->input('per_page', 15));

        return MessageTemplateResource::collection($templates);
    }

    public function store(StoreMessageTemplateRequest $request): JsonResponse
    {
        Gate::authorize('create', MessageTemplate::class);

        $template = MessageTemplate::create($request->validated());

        AuditLog::record(
            action: 'message_template_created',
            userId: $request->user()->id,
            metadata: [
                'template_id' => $template->id,
                'name' => $template->name,
                'channel' => $template->channel->value,
            ],
        );

        return (new MessageTemplateResource($template))
            ->response()
            ->setStatusCode(201);
    }

    public function show(MessageTemplate $messageTemplate): MessageTemplateResource
    {
        Gate::authorize('view', $messageTemplate);

        return new MessageTemplateResource($messageTemplate);
    }

    public function update(UpdateMessageTemplateRequest $request, MessageTemplate $messageTemplate): MessageTemplateResource
    {
        Gate::authorize('update', $messageTemplate);

        $oldValues = [
            'name' => $messageTemplate->name,
            'channel' => $messageTemplate->channel?->value,
            'body' => $messageTemplate->body,
            'is_active' => $messageTemplate->is_active,
        ];

        $messageTemplate->update($request->validated());

        $newValues = [
            'name' => $messageTemplate->name,
            'channel' => $messageTemplate->channel?->value,
            'body' => $messageTemplate->body,
            'is_active' => $messageTemplate->is_active,
        ];

        AuditLog::record(
            action: 'message_template_updated',
            userId: $request->user()->id,
            metadata: [
                'template_id' => $messageTemplate->id,
                'changes' => array_diff_assoc($newValues, $oldValues),
            ],
        );

        return new MessageTemplateResource($messageTemplate);
    }

    public function destroy(Request $request, MessageTemplate $messageTemplate): JsonResponse
    {
        Gate::authorize('delete', $messageTemplate);

        AuditLog::record(
            action: 'message_template_deleted',
            userId: $request->user()->id,
            metadata: [
                'template_id' => $messageTemplate->id,
                'name' => $messageTemplate->name,
            ],
        );

        $messageTemplate->delete();

        return response()->json(null, 204);
    }

    public function preview(Request $request, MessageTemplate $messageTemplate): JsonResponse
    {
        Gate::authorize('view', $messageTemplate);

        $sampleData = [
            'nome' => 'Mario Rossi',
            'data' => now()->addDays(7)->format('d/m/Y'),
            'ora' => '10:30',
            'telefono' => '+39 123 456 7890',
            'data_richiamo' => now()->addMonths(6)->format('d/m/Y'),
        ];

        $data = array_merge($sampleData, $request->input('data', []));
        $rendered = $messageTemplate->render($data);

        return response()->json([
            'data' => [
                'subject' => $rendered['subject'],
                'body' => $rendered['body'],
                'variables_used' => $messageTemplate->extractVariables(),
            ],
        ]);
    }
}
