<?php

namespace App\Http\Controllers\Api;

use App\Enums\RecallStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\RecordContactOutcomeRequest;
use App\Http\Requests\StoreRecallTaskRequest;
use App\Http\Requests\UpdateRecallTaskRequest;
use App\Http\Resources\RecallTaskResource;
use App\Models\AuditLog;
use App\Models\RecallTask;
use App\Models\Visit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class RecallController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', RecallTask::class);

        $query = RecallTask::with(['patient', 'visit', 'assignee']);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->input('patient_id'));
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->input('assigned_to'));
        }

        if ($request->boolean('overdue_only', false)) {
            $query->where('due_date', '<', now()->toDateString())
                ->whereNotIn('status', [
                    RecallStatus::Scheduled,
                    RecallStatus::Declined,
                    RecallStatus::Expired,
                ]);
        }

        if ($request->has('due_from')) {
            $query->where('due_date', '>=', $request->input('due_from'));
        }

        if ($request->has('due_to')) {
            $query->where('due_date', '<=', $request->input('due_to'));
        }

        $tasks = $query->orderBy('due_date')
            ->orderBy('created_at')
            ->paginate($request->input('per_page', 15));

        return RecallTaskResource::collection($tasks);
    }

    public function queue(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', RecallTask::class);

        $daysAhead = (int) $request->input('days_ahead', 7);

        $query = RecallTask::with(['patient', 'visit', 'assignee'])
            ->whereIn('status', [
                RecallStatus::Pending,
                RecallStatus::Contacted,
                RecallStatus::NoAnswer,
            ])
            ->where('due_date', '<=', now()->addDays($daysAhead)->toDateString())
            ->orderBy('due_date')
            ->orderByDesc('contact_attempts');

        $tasks = $query->paginate($request->input('per_page', 15));

        return RecallTaskResource::collection($tasks);
    }

    public function store(StoreRecallTaskRequest $request): JsonResponse
    {
        Gate::authorize('create', RecallTask::class);

        $task = RecallTask::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        $task->load(['patient', 'visit', 'assignee']);

        AuditLog::record(
            action: 'recall_task_created',
            userId: $request->user()->id,
            metadata: [
                'recall_task_id' => $task->id,
                'patient_id' => $task->patient_id,
                'due_date' => $task->due_date->toDateString(),
            ],
        );

        return (new RecallTaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    public function show(RecallTask $recall): RecallTaskResource
    {
        Gate::authorize('view', $recall);

        $recall->load(['patient', 'visit', 'creator', 'assignee', 'resultingAppointment']);

        return new RecallTaskResource($recall);
    }

    public function update(UpdateRecallTaskRequest $request, RecallTask $recall): RecallTaskResource
    {
        Gate::authorize('update', $recall);

        $oldStatus = $recall->status;

        $recall->update($request->validated());

        if ($request->has('status') && $oldStatus !== $recall->status) {
            AuditLog::record(
                action: 'recall_status_changed',
                userId: $request->user()->id,
                metadata: [
                    'recall_task_id' => $recall->id,
                    'patient_id' => $recall->patient_id,
                    'old_status' => $oldStatus->value,
                    'new_status' => $recall->status->value,
                ],
            );
        }

        $recall->load(['patient', 'visit', 'assignee']);

        return new RecallTaskResource($recall);
    }

    public function destroy(Request $request, RecallTask $recall): JsonResponse
    {
        Gate::authorize('delete', $recall);

        AuditLog::record(
            action: 'recall_task_deleted',
            userId: $request->user()->id,
            metadata: [
                'recall_task_id' => $recall->id,
                'patient_id' => $recall->patient_id,
            ],
        );

        $recall->delete();

        return response()->json(null, 204);
    }

    public function recordOutcome(RecordContactOutcomeRequest $request, RecallTask $recall): RecallTaskResource
    {
        Gate::authorize('recordOutcome', $recall);

        $oldStatus = $recall->status;
        $newStatus = RecallStatus::from($request->input('outcome'));

        $recall->recordContactAttempt();

        $updateData = [
            'status' => $newStatus,
        ];

        if ($request->has('notes')) {
            $updateData['notes'] = $request->input('notes');
        }

        if ($request->has('resulting_appointment_id')) {
            $updateData['resulting_appointment_id'] = $request->input('resulting_appointment_id');
        }

        $recall->update($updateData);

        AuditLog::record(
            action: 'recall_contact_recorded',
            userId: $request->user()->id,
            metadata: [
                'recall_task_id' => $recall->id,
                'patient_id' => $recall->patient_id,
                'old_status' => $oldStatus->value,
                'new_status' => $newStatus->value,
                'contact_attempts' => $recall->contact_attempts,
                'resulting_appointment_id' => $recall->resulting_appointment_id,
            ],
        );

        $recall->load(['patient', 'visit', 'assignee', 'resultingAppointment']);

        return new RecallTaskResource($recall);
    }

    public function generateFromVisits(Request $request): JsonResponse
    {
        Gate::authorize('create', RecallTask::class);

        $daysAhead = $request->input('days_ahead', 30);

        $visits = Visit::whereNotNull('recommended_recall_date')
            ->whereBetween('recommended_recall_date', [
                now()->toDateString(),
                now()->addDays($daysAhead)->toDateString(),
            ])
            ->whereDoesntHave('patient.recallTasks', function ($query) {
                $query->whereIn('status', [
                    RecallStatus::Pending,
                    RecallStatus::Contacted,
                    RecallStatus::NoAnswer,
                ]);
            })
            ->get();

        $created = 0;
        foreach ($visits as $visit) {
            RecallTask::create([
                'patient_id' => $visit->patient_id,
                'visit_id' => $visit->id,
                'due_date' => $visit->recommended_recall_date,
                'created_by' => $request->user()->id,
            ]);
            $created++;
        }

        return response()->json([
            'message' => "Created {$created} recall tasks from visits.",
            'count' => $created,
        ]);
    }
}
