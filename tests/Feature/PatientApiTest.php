<?php

namespace Tests\Feature;

use App\Enums\PatientStatus;
use App\Models\AuditLog;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_patients(): void
    {
        $user = User::factory()->create();
        Patient::factory()->count(5)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/patients');

        $response->assertOk();
        $response->assertJsonCount(5, 'data');
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'first_name',
                    'last_name',
                    'full_name',
                    'email',
                    'phone',
                    'date_of_birth',
                    'notes',
                    'consents',
                    'status',
                    'created_at',
                    'updated_at',
                ],
            ],
            'meta',
            'links',
        ]);
    }

    public function test_can_filter_patients_by_status(): void
    {
        $user = User::factory()->create();
        Patient::factory()->count(3)->create(['status' => PatientStatus::Active]);
        Patient::factory()->count(2)->create(['status' => PatientStatus::Inactive]);

        $response = $this->actingAs($user)
            ->getJson('/api/patients?status=active');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
    }

    public function test_can_search_patients(): void
    {
        $user = User::factory()->create();
        Patient::factory()->create(['first_name' => 'Mario', 'last_name' => 'Rossi']);
        Patient::factory()->create(['first_name' => 'Luigi', 'last_name' => 'Verdi']);

        $response = $this->actingAs($user)
            ->getJson('/api/patients?search=Mario');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.first_name', 'Mario');
    }

    public function test_can_create_patient(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/patients', [
                'first_name' => 'Giovanni',
                'last_name' => 'Bianchi',
                'email' => 'giovanni@example.com',
                'phone' => '+39 333 1234567',
                'date_of_birth' => '1985-06-15',
                'notes' => 'New patient',
                'consents' => [
                    'marketing' => true,
                    'data_processing' => true,
                ],
                'status' => 'active',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.first_name', 'Giovanni');
        $response->assertJsonPath('data.last_name', 'Bianchi');
        $response->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('patients', [
            'first_name' => 'Giovanni',
            'last_name' => 'Bianchi',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'patient_created',
            'user_id' => $user->id,
        ]);
    }

    public function test_can_show_patient(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $response = $this->actingAs($user)
            ->getJson("/api/patients/{$patient->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $patient->id);
    }

    public function test_can_update_patient(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create([
            'first_name' => 'Old Name',
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/patients/{$patient->id}", [
                'first_name' => 'New Name',
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.first_name', 'New Name');
    }

    public function test_sensitive_changes_are_audited(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create([
            'email' => 'old@example.com',
            'consents' => ['marketing' => false],
        ]);

        $this->actingAs($user)
            ->putJson("/api/patients/{$patient->id}", [
                'email' => 'new@example.com',
                'consents' => ['marketing' => true],
            ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'patient_sensitive_update',
            'user_id' => $user->id,
        ]);

        $auditLog = AuditLog::where('action', 'patient_sensitive_update')->first();
        $this->assertArrayHasKey('email', $auditLog->metadata['changes']);
        $this->assertArrayHasKey('consents', $auditLog->metadata['changes']);
    }

    public function test_owner_can_delete_patient(): void
    {
        $owner = User::factory()->owner()->create();
        $patient = Patient::factory()->create();

        $response = $this->actingAs($owner)
            ->deleteJson("/api/patients/{$patient->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
    }

    public function test_admin_can_delete_patient(): void
    {
        $admin = User::factory()->admin()->create();
        $patient = Patient::factory()->create();

        $response = $this->actingAs($admin)
            ->deleteJson("/api/patients/{$patient->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
    }

    public function test_operator_cannot_delete_patient(): void
    {
        $operator = User::factory()->operator()->create();
        $patient = Patient::factory()->create();

        $response = $this->actingAs($operator)
            ->deleteJson("/api/patients/{$patient->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('patients', ['id' => $patient->id, 'deleted_at' => null]);
    }

    public function test_unauthenticated_user_cannot_access_patients(): void
    {
        $response = $this->getJson('/api/patients');

        $response->assertUnauthorized();
    }

    public function test_validation_errors_on_create(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/patients', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['first_name', 'last_name']);
    }

    public function test_date_of_birth_must_be_in_past(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/patients', [
                'first_name' => 'Test',
                'last_name' => 'User',
                'date_of_birth' => now()->addDay()->toDateString(),
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['date_of_birth']);
    }
}
