<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommunicationLogRequest;
use App\Http\Requests\UpdateCommunicationStatusRequest;
use App\Http\Resources\CommunicationLogResource;
use App\Models\AuditLog;
use App\Models\CommunicationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class CommunicationLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', CommunicationLog::class);

        $query = CommunicationLog::with(['patient', 'sender']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->input('patient_id'));
        }

        if ($request->has('appointment_id')) {
            $query->where('appointment_id', $request->input('appointment_id'));
        }

        if ($request->has('recall_task_id')) {
            $query->where('recall_task_id', $request->input('recall_task_id'));
        }

        if ($request->has('channel')) {
            $query->where('channel', $request->input('channel'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('reminder_type')) {
            $query->where('reminder_type', $request->input('reminder_type'));
        }

        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->input('from'));
        }

        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->input('to'));
        }

        $logs = $query->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return CommunicationLogResource::collection($logs);
    }

    public function store(StoreCommunicationLogRequest $request): JsonResponse
    {
        Gate::authorize('create', CommunicationLog::class);

        $log = CommunicationLog::create([
            ...$request->validated(),
            'sent_by' => $request->user()->id,
        ]);

        AuditLog::record(
            action: 'communication_logged',
            userId: $request->user()->id,
            metadata: [
                'communication_log_id' => $log->id,
                'patient_id' => $log->patient_id,
                'channel' => $log->channel->value,
                'recipient' => $log->recipient,
            ],
        );

        $log->load(['patient', 'sender']);

        return (new CommunicationLogResource($log))
            ->response()
            ->setStatusCode(201);
    }

    public function show(CommunicationLog $communicationLog): CommunicationLogResource
    {
        Gate::authorize('view', $communicationLog);

        $communicationLog->load(['patient', 'appointment', 'sender', 'messageTemplate']);

        return new CommunicationLogResource($communicationLog);
    }

    public function updateStatus(UpdateCommunicationStatusRequest $request, CommunicationLog $communicationLog): CommunicationLogResource
    {
        Gate::authorize('update', $communicationLog);

        $oldStatus = $communicationLog->status;

        $updateData = ['status' => $request->input('status')];

        if ($request->has('external_id')) {
            $updateData['external_id'] = $request->input('external_id');
        }

        if ($request->has('error_message')) {
            $updateData['error_message'] = $request->input('error_message');
        }

        if (in_array($request->input('status'), ['sent', 'delivered'])) {
            $updateData['sent_at'] = $communicationLog->sent_at ?? now();
        }

        $communicationLog->update($updateData);

        AuditLog::record(
            action: 'communication_status_updated',
            userId: $request->user()->id,
            metadata: [
                'communication_log_id' => $communicationLog->id,
                'old_status' => $oldStatus->value,
                'new_status' => $communicationLog->status->value,
            ],
        );

        return new CommunicationLogResource($communicationLog);
    }

    public function destroy(Request $request, CommunicationLog $communicationLog): JsonResponse
    {
        Gate::authorize('delete', $communicationLog);

        AuditLog::record(
            action: 'communication_log_deleted',
            userId: $request->user()->id,
            metadata: [
                'communication_log_id' => $communicationLog->id,
                'patient_id' => $communicationLog->patient_id,
            ],
        );

        $communicationLog->delete();

        return response()->json(null, 204);
    }
}
