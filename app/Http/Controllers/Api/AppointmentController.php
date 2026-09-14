<?php

namespace App\Http\Controllers\Api;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Http\Requests\UpdateAppointmentStatusRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\AuditLog;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Appointment::class);

        $query = Appointment::with('patient');

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->input('patient_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('from')) {
            $query->where('scheduled_at', '>=', $request->input('from'));
        }

        if ($request->has('to')) {
            $query->where('scheduled_at', '<=', $request->input('to'));
        }

        if ($request->has('date')) {
            $date = $request->input('date');
            $query->whereDate('scheduled_at', $date);
        }

        $appointments = $query->orderBy('scheduled_at')
            ->paginate($request->input('per_page', 15));

        return AppointmentResource::collection($appointments);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        Gate::authorize('create', Appointment::class);

        $data = $request->validated();
        $data['status'] = AppointmentStatus::Scheduled->value;

        $appointment = Appointment::create($data);
        $appointment->load('patient');

        AuditLog::record(
            action: 'appointment_created',
            userId: $request->user()->id,
            metadata: [
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'scheduled_at' => $appointment->scheduled_at->toIso8601String(),
            ],
        );

        return (new AppointmentResource($appointment))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Appointment $appointment): AppointmentResource
    {
        Gate::authorize('view', $appointment);

        $appointment->load(['patient', 'visit']);

        return new AppointmentResource($appointment);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): AppointmentResource
    {
        Gate::authorize('update', $appointment);

        if ($appointment->status->isFinal()) {
            throw ValidationException::withMessages([
                'status' => ['Cannot update an appointment with a final status.'],
            ]);
        }

        $appointment->update($request->validated());
        $appointment->load('patient');

        return new AppointmentResource($appointment->fresh());
    }

    public function destroy(Request $request, Appointment $appointment): Response
    {
        Gate::authorize('delete', $appointment);

        AuditLog::record(
            action: 'appointment_deleted',
            userId: $request->user()->id,
            metadata: [
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
            ],
        );

        $appointment->delete();

        return response()->noContent();
    }

    public function updateStatus(UpdateAppointmentStatusRequest $request, Appointment $appointment): AppointmentResource
    {
        Gate::authorize('update', $appointment);

        $newStatus = AppointmentStatus::from($request->validated()['status']);

        if (! $appointment->canTransitionTo($newStatus)) {
            throw ValidationException::withMessages([
                'status' => ['Cannot change status from a final state.'],
            ]);
        }

        $oldStatus = $appointment->status;
        $appointment->update(['status' => $newStatus]);

        AuditLog::record(
            action: 'appointment_status_changed',
            userId: $request->user()->id,
            metadata: [
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'old_status' => $oldStatus->value,
                'new_status' => $newStatus->value,
            ],
        );

        $appointment->load('patient');

        return new AppointmentResource($appointment->fresh());
    }
}
