<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Http\Resources\PatientResource;
use App\Models\AuditLog;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class PatientController extends Controller
{
    protected array $sensitiveFields = ['consents', 'email', 'phone', 'status'];

    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Patient::class);

        $query = Patient::query();

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $patients = $query->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($request->input('per_page', 15));

        return PatientResource::collection($patients);
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        Gate::authorize('create', Patient::class);

        $patient = Patient::create($request->validated());

        AuditLog::record(
            action: 'patient_created',
            userId: $request->user()->id,
            metadata: [
                'patient_id' => $patient->id,
                'data' => $request->only(['first_name', 'last_name', 'email', 'phone']),
            ],
        );

        return (new PatientResource($patient))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Patient $patient): PatientResource
    {
        Gate::authorize('view', $patient);

        return new PatientResource($patient);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): PatientResource
    {
        Gate::authorize('update', $patient);

        $validated = $request->validated();
        $sensitiveChanges = $this->detectSensitiveChanges($patient, $validated);

        $patient->update($validated);

        if (! empty($sensitiveChanges)) {
            AuditLog::record(
                action: 'patient_sensitive_update',
                userId: $request->user()->id,
                metadata: [
                    'patient_id' => $patient->id,
                    'changes' => $sensitiveChanges,
                ],
            );
        }

        return new PatientResource($patient->fresh());
    }

    public function destroy(Request $request, Patient $patient): Response
    {
        Gate::authorize('delete', $patient);

        AuditLog::record(
            action: 'patient_deleted',
            userId: $request->user()->id,
            metadata: [
                'patient_id' => $patient->id,
                'patient_name' => $patient->full_name,
            ],
        );

        $patient->delete();

        return response()->noContent();
    }

    protected function detectSensitiveChanges(Patient $patient, array $newData): array
    {
        $changes = [];

        foreach ($this->sensitiveFields as $field) {
            if (! array_key_exists($field, $newData)) {
                continue;
            }

            $oldValue = $patient->getAttribute($field);
            $newValue = $newData[$field];

            if ($oldValue instanceof \BackedEnum) {
                $oldValue = $oldValue->value;
            }

            if ($oldValue !== $newValue) {
                $changes[$field] = [
                    'old' => $this->maskSensitiveValue($field, $oldValue),
                    'new' => $this->maskSensitiveValue($field, $newValue),
                ];
            }
        }

        return $changes;
    }

    protected function maskSensitiveValue(string $field, mixed $value): mixed
    {
        if ($value === null) {
            return null;
        }

        if ($field === 'email' && is_string($value)) {
            $parts = explode('@', $value);
            if (count($parts) === 2) {
                return substr($parts[0], 0, 2) . '***@' . $parts[1];
            }
        }

        if ($field === 'phone' && is_string($value)) {
            return substr($value, 0, 3) . '***' . substr($value, -2);
        }

        return $value;
    }
}
