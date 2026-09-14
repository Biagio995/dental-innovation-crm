<?php

namespace Tests\Feature;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VisitApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_visits(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->completed()->create(['patient_id' => $patient->id]);
        Visit::factory()->create([
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/visits');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'appointment_id',
                    'patient_id',
                    'treatment_notes',
                    'recommended_recall_date',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }

    public function test_can_filter_visits_by_patient(): void
    {
        $user = User::factory()->create();
        $patient1 = Patient::factory()->create();
        $patient2 = Patient::factory()->create();

        $appointment1 = Appointment::factory()->completed()->create(['patient_id' => $patient1->id]);
        $appointment2 = Appointment::factory()->completed()->create(['patient_id' => $patient2->id]);

        Visit::factory()->create(['appointment_id' => $appointment1->id, 'patient_id' => $patient1->id]);
        Visit::factory()->create(['appointment_id' => $appointment2->id, 'patient_id' => $patient2->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/visits?patient_id={$patient1->id}");

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_can_show_visit(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->completed()->create(['patient_id' => $patient->id]);
        $visit = Visit::factory()->create([
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/visits/{$visit->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $visit->id);
    }

    public function test_can_complete_appointment_visit(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->scheduled()->create(['patient_id' => $patient->id]);

        $recallDate = now()->addMonths(6)->toDateString();

        $response = $this->actingAs($user)
            ->postJson("/api/appointments/{$appointment->id}/complete", [
                'treatment_notes' => 'Standard cleaning performed.',
                'recommended_recall_date' => $recallDate,
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.treatment_notes', 'Standard cleaning performed.');
        $response->assertJsonPath('data.recommended_recall_date', $recallDate);

        $appointment->refresh();
        $this->assertEquals(AppointmentStatus::Completed, $appointment->status);

        $this->assertDatabaseHas('visits', [
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'visit_completed',
            'user_id' => $user->id,
        ]);
    }

    public function test_can_complete_visit_without_recall_date(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->confirmed()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->postJson("/api/appointments/{$appointment->id}/complete", [
                'treatment_notes' => 'Extraction completed.',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.recommended_recall_date', null);
    }

    public function test_cannot_complete_already_completed_appointment(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->completed()->create(['patient_id' => $patient->id]);
        Visit::factory()->create([
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
        ]);

        $response = $this->actingAs($user)
            ->postJson("/api/appointments/{$appointment->id}/complete", [
                'treatment_notes' => 'Another completion attempt.',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['appointment']);
    }

    public function test_cannot_complete_cancelled_appointment(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->cancelled()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->postJson("/api/appointments/{$appointment->id}/complete", []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['appointment']);
    }

    public function test_cannot_complete_no_show_appointment(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->noShow()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->postJson("/api/appointments/{$appointment->id}/complete", []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['appointment']);
    }

    public function test_recall_date_must_be_in_future(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->scheduled()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->postJson("/api/appointments/{$appointment->id}/complete", [
                'recommended_recall_date' => now()->subDay()->toDateString(),
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['recommended_recall_date']);
    }
}
