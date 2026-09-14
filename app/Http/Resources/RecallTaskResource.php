<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecallTaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof \App\Enums\RecallStatus
            ? $this->status
            : \App\Enums\RecallStatus::tryFrom($this->status) ?? \App\Enums\RecallStatus::Pending;

        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'patient' => new PatientResource($this->whenLoaded('patient')),
            'visit_id' => $this->visit_id,
            'visit' => new VisitResource($this->whenLoaded('visit')),
            'due_date' => $this->due_date->toDateString(),
            'status' => $status->value,
            'status_label' => $status->label(),
            'notes' => $this->notes,
            'contact_attempts' => $this->contact_attempts,
            'last_contact_at' => $this->last_contact_at?->toIso8601String(),
            'is_overdue' => $this->due_date->isPast() && ! $status->isFinal(),
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'assigned_to' => $this->assigned_to,
            'assignee' => $this->whenLoaded('assignee', fn () => [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
            ]),
            'resulting_appointment_id' => $this->resulting_appointment_id,
            'resulting_appointment' => new AppointmentResource($this->whenLoaded('resultingAppointment')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
