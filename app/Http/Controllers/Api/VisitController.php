<?php

namespace App\Http\Controllers\Api;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CompleteVisitRequest;
use App\Http\Resources\VisitResource;
use App\Models\AuditLog;
use App\Models\Appointment;
use App\Models\Visit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class VisitController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Visit::class);

        $query = Visit::with(['patient', 'appointment']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->input('patient_id'));
        }

        $visits = $query->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return VisitResource::collection($visits);
    }

    public function show(Visit $visit): VisitResource
    {
        Gate::authorize('view', $visit);

        return new VisitResource($visit);
    }

    public function complete(CompleteVisitRequest $request, Appointment $appointment): JsonResponse
    {
        Gate::authorize('update', $appointment);

        if ($appointment->status === AppointmentStatus::Completed && $appointment->visit()->exists()) {
            throw ValidationException::withMessages([
                'appointment' => ['This appointment already has a completed visit.'],
            ]);
        }

        if ($appointment->status->isFinal() && $appointment->status !== AppointmentStatus::Completed) {
            throw ValidationException::withMessages([
                'appointment' => ['Cannot complete a visit for a cancelled or no-show appointment.'],
            ]);
        }

        $visit = DB::transaction(function () use ($request, $appointment) {
            $appointment->update(['status' => AppointmentStatus::Completed]);

            return Visit::create([
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'treatment_notes' => $request->validated()['treatment_notes'] ?? null,
                'recommended_recall_date' => $request->validated()['recommended_recall_date'] ?? null,
            ]);
        });

        AuditLog::record(
            action: 'visit_completed',
            userId: $request->user()->id,
            metadata: [
                'visit_id' => $visit->id,
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'recommended_recall_date' => $visit->recommended_recall_date?->toDateString(),
            ],
        );

        return (new VisitResource($visit))
            ->response()
            ->setStatusCode(201);
    }
}
