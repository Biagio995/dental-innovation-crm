<?php

namespace Tests\Feature;

use App\Enums\CommunicationChannel;
use App\Enums\CommunicationStatus;
use App\Models\Appointment;
use App\Models\CommunicationLog;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunicationLogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_communication_logs(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        CommunicationLog::factory()->count(3)->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/communication-logs');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'patient_id',
                    'channel',
                    'channel_label',
                    'status',
                    'status_label',
                    'recipient',
                    'body',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }

    public function test_can_filter_logs_by_patient(): void
    {
        $user = User::factory()->create();
        $patient1 = Patient::factory()->create();
        $patient2 = Patient::factory()->create();

        CommunicationLog::factory()->count(2)->create(['patient_id' => $patient1->id]);
        CommunicationLog::factory()->count(3)->create(['patient_id' => $patient2->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/communication-logs?patient_id={$patient1->id}");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_can_filter_logs_by_channel(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        CommunicationLog::factory()->sms()->count(2)->create(['patient_id' => $patient->id]);
        CommunicationLog::factory()->email()->count(3)->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/communication-logs?channel=sms');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_can_filter_logs_by_status(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        CommunicationLog::factory()->sent()->count(2)->create(['patient_id' => $patient->id]);
        CommunicationLog::factory()->failed()->count(1)->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/communication-logs?status=sent');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_can_filter_logs_by_appointment(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        CommunicationLog::factory()->create([
            'patient_id' => $patient->id,
            'appointment_id' => $appointment->id,
        ]);
        CommunicationLog::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/communication-logs?appointment_id={$appointment->id}");

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_can_create_communication_log(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/communication-logs', [
                'patient_id' => $patient->id,
                'channel' => 'sms',
                'recipient' => '+39 123 456 7890',
                'body' => 'Test message content',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.patient_id', $patient->id);
        $response->assertJsonPath('data.channel', 'sms');
        $response->assertJsonPath('data.status', 'queued');

        $this->assertDatabaseHas('communication_logs', [
            'patient_id' => $patient->id,
            'sent_by' => $user->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'communication_logged',
            'user_id' => $user->id,
        ]);
    }

    public function test_can_create_communication_log_linked_to_appointment(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->postJson('/api/communication-logs', [
                'patient_id' => $patient->id,
                'appointment_id' => $appointment->id,
                'channel' => 'email',
                'recipient' => 'test@example.com',
                'subject' => 'Appointment Reminder',
                'body' => 'Your appointment is tomorrow.',
                'reminder_type' => 'appointment_24h',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.appointment_id', $appointment->id);
        $response->assertJsonPath('data.reminder_type', 'appointment_24h');
    }

    public function test_can_show_communication_log(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $log = CommunicationLog::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/communication-logs/{$log->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $log->id);
    }

    public function test_can_update_communication_status(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $log = CommunicationLog::factory()->create([
            'patient_id' => $patient->id,
            'status' => CommunicationStatus::Queued,
        ]);

        $response = $this->actingAs($user)
            ->patchJson("/api/communication-logs/{$log->id}/status", [
                'status' => 'sent',
                'external_id' => 'ext_123456',
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.status', 'sent');
        $response->assertJsonPath('data.external_id', 'ext_123456');

        $log->refresh();
        $this->assertNotNull($log->sent_at);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'communication_status_updated',
            'user_id' => $user->id,
        ]);
    }

    public function test_can_update_status_to_failed_with_error(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $log = CommunicationLog::factory()->create([
            'patient_id' => $patient->id,
            'status' => CommunicationStatus::Queued,
        ]);

        $response = $this->actingAs($user)
            ->patchJson("/api/communication-logs/{$log->id}/status", [
                'status' => 'failed',
                'error_message' => 'Invalid phone number',
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.status', 'failed');
        $response->assertJsonPath('data.error_message', 'Invalid phone number');
    }

    public function test_admin_can_delete_communication_log(): void
    {
        $admin = User::factory()->admin()->create();
        $patient = Patient::factory()->create();
        $log = CommunicationLog::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($admin)
            ->deleteJson("/api/communication-logs/{$log->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('communication_logs', ['id' => $log->id]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'communication_log_deleted',
            'user_id' => $admin->id,
        ]);
    }

    public function test_operator_cannot_delete_communication_log(): void
    {
        $operator = User::factory()->operator()->create();
        $patient = Patient::factory()->create();
        $log = CommunicationLog::factory()->create(['patient_id' => $patient->id]);

        $response = $this->actingAs($operator)
            ->deleteJson("/api/communication-logs/{$log->id}");

        $response->assertForbidden();
    }

    public function test_validation_requires_patient_and_body(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/communication-logs', [
                'channel' => 'sms',
                'recipient' => '+39 123 456 7890',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['patient_id', 'body']);
    }

    public function test_validation_requires_valid_channel(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/communication-logs', [
                'patient_id' => $patient->id,
                'channel' => 'whatsapp',
                'recipient' => '+39 123 456 7890',
                'body' => 'Test',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['channel']);
    }
}
