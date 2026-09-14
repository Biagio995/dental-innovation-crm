<?php

namespace Tests\Feature;

use App\Enums\AppointmentStatus;
use App\Enums\RecallStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\RecallTask;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecallApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_recall_tasks(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        RecallTask::factory()->count(3)->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/recalls');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'patient_id',
                    'due_date',
                    'status',
                    'status_label',
                    'contact_attempts',
                    'is_overdue',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }

    public function test_can_filter_recalls_by_status(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        RecallTask::factory()->pending()->count(2)->create(['patient_id' => $patient->id]);
        RecallTask::factory()->contacted()->count(3)->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/recalls?status=pending');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_can_filter_overdue_recalls(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        RecallTask::factory()->overdue()->count(2)->create(['patient_id' => $patient->id]);
        RecallTask::factory()->pending()->create([
            'patient_id' => $patient->id,
            'due_date' => now()->addDays(10),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/recalls?overdue_only=true');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_can_get_recalls_queue(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        RecallTask::factory()->dueToday()->create(['patient_id' => $patient->id]);
        RecallTask::factory()->pending()->create([
            'patient_id' => $patient->id,
            'due_date' => now()->addDays(5),
        ]);
        RecallTask::factory()->scheduled()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/recalls/queue?days_ahead=7');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_can_create_recall_task(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/recalls', [
                'patient_id' => $patient->id,
                'due_date' => now()->addMonths(6)->toDateString(),
                'notes' => 'Regular checkup recall',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.patient_id', $patient->id);
        $response->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('recall_tasks', [
            'patient_id' => $patient->id,
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recall_task_created',
            'user_id' => $user->id,
        ]);
    }

    public function test_can_show_recall_task(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/recalls/{$recall->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $recall->id);
    }

    public function test_can_update_recall_task(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->pending()->create(['patient_id' => $patient->id]);

        $newDueDate = now()->addMonths(3)->toDateString();

        $response = $this->actingAs($user)
            ->putJson("/api/recalls/{$recall->id}", [
                'due_date' => $newDueDate,
                'notes' => 'Updated notes',
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.due_date', $newDueDate);
    }

    public function test_admin_can_delete_recall_task(): void
    {
        $admin = User::factory()->admin()->create();
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($admin)
            ->deleteJson("/api/recalls/{$recall->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('recall_tasks', ['id' => $recall->id]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recall_task_deleted',
            'user_id' => $admin->id,
        ]);
    }

    public function test_operator_cannot_delete_recall_task(): void
    {
        $operator = User::factory()->operator()->create();
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($operator)
            ->deleteJson("/api/recalls/{$recall->id}");

        $response->assertForbidden();
    }

    public function test_can_record_contact_outcome_no_answer(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->pending()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->postJson("/api/recalls/{$recall->id}/contact-outcome", [
                'outcome' => 'no_answer',
                'notes' => 'Called but no answer',
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.status', 'no_answer');
        $response->assertJsonPath('data.contact_attempts', 1);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recall_contact_recorded',
            'user_id' => $user->id,
        ]);
    }

    public function test_can_record_contact_outcome_scheduled(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->pending()->create(['patient_id' => $patient->id]);
        $appointment = Appointment::factory()->scheduled()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->postJson("/api/recalls/{$recall->id}/contact-outcome", [
                'outcome' => 'scheduled',
                'resulting_appointment_id' => $appointment->id,
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.status', 'scheduled');
        $response->assertJsonPath('data.resulting_appointment_id', $appointment->id);
    }

    public function test_scheduled_outcome_requires_appointment(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->pending()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->postJson("/api/recalls/{$recall->id}/contact-outcome", [
                'outcome' => 'scheduled',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['resulting_appointment_id']);
    }

    public function test_can_generate_recalls_from_visits(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->completed()->create(['patient_id' => $patient->id]);
        Visit::factory()->create([
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'recommended_recall_date' => now()->addDays(10),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/recalls/generate-from-visits', [
                'days_ahead' => 30,
            ]);

        $response->assertOk();
        $response->assertJsonPath('count', 1);

        $this->assertDatabaseHas('recall_tasks', [
            'patient_id' => $patient->id,
        ]);
    }

    public function test_due_date_validation(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/recalls', [
                'patient_id' => $patient->id,
                'due_date' => now()->subDay()->toDateString(),
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['due_date']);
    }
}
