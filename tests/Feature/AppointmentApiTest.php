<?php

namespace Tests\Feature;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_appointments(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        Appointment::factory()->count(3)->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/appointments');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'patient_id',
                    'patient',
                    'scheduled_at',
                    'duration_minutes',
                    'type',
                    'notes',
                    'status',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }

    public function test_can_filter_appointments_by_patient(): void
    {
        $user = User::factory()->create();
        $patient1 = Patient::factory()->create();
        $patient2 = Patient::factory()->create();
        Appointment::factory()->count(2)->create(['patient_id' => $patient1->id]);
        Appointment::factory()->count(3)->create(['patient_id' => $patient2->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/appointments?patient_id={$patient1->id}");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_can_filter_appointments_by_status(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        Appointment::factory()->count(2)->scheduled()->create(['patient_id' => $patient->id]);
        Appointment::factory()->count(1)->confirmed()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/appointments?status=scheduled');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_can_filter_appointments_by_date_range(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'scheduled_at' => now()->addDays(5),
        ]);
        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'scheduled_at' => now()->addDays(15),
        ]);

        $from = now()->addDays(3)->toDateTimeString();
        $to = now()->addDays(10)->toDateTimeString();

        $response = $this->actingAs($user)
            ->getJson("/api/appointments?from={$from}&to={$to}");

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_can_create_appointment(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $scheduledAt = now()->addDays(7)->toIso8601String();

        $response = $this->actingAs($user)
            ->postJson('/api/appointments', [
                'patient_id' => $patient->id,
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => 30,
                'type' => 'checkup',
                'notes' => 'Regular checkup',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.patient_id', $patient->id);
        $response->assertJsonPath('data.status', 'scheduled');
        $response->assertJsonPath('data.type', 'checkup');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'appointment_created',
            'user_id' => $user->id,
        ]);
    }

    public function test_can_show_appointment(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/appointments/{$appointment->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $appointment->id);
        $response->assertJsonPath('data.patient.id', $patient->id);
    }

    public function test_can_update_appointment(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->scheduled()->create(['patient_id' => $patient->id]);

        $newScheduledAt = now()->addDays(14)->toIso8601String();

        $response = $this->actingAs($user)
            ->putJson("/api/appointments/{$appointment->id}", [
                'scheduled_at' => $newScheduledAt,
                'duration_minutes' => 60,
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.duration_minutes', 60);
    }

    public function test_cannot_update_appointment_with_final_status(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->completed()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->putJson("/api/appointments/{$appointment->id}", [
                'duration_minutes' => 60,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['status']);
    }

    public function test_can_update_appointment_status(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->scheduled()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->patchJson("/api/appointments/{$appointment->id}/status", [
                'status' => 'confirmed',
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'appointment_status_changed',
            'user_id' => $user->id,
        ]);
    }

    public function test_cannot_change_status_from_final_state(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->cancelled()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->patchJson("/api/appointments/{$appointment->id}/status", [
                'status' => 'scheduled',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['status']);
    }

    public function test_owner_can_delete_appointment(): void
    {
        $owner = User::factory()->owner()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($owner)
            ->deleteJson("/api/appointments/{$appointment->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted('appointments', ['id' => $appointment->id]);
    }

    public function test_admin_can_delete_appointment(): void
    {
        $admin = User::factory()->admin()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($admin)
            ->deleteJson("/api/appointments/{$appointment->id}");

        $response->assertNoContent();
    }

    public function test_operator_cannot_delete_appointment(): void
    {
        $operator = User::factory()->operator()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($operator)
            ->deleteJson("/api/appointments/{$appointment->id}");

        $response->assertForbidden();
    }

    public function test_validation_requires_patient_and_scheduled_at(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/appointments', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['patient_id', 'scheduled_at']);
    }

    public function test_patient_must_exist(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/appointments', [
                'patient_id' => 99999,
                'scheduled_at' => now()->addDays(7)->toIso8601String(),
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['patient_id']);
    }
}
