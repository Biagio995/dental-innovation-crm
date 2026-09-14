<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\CommunicationLog;
use App\Models\MessageTemplate;
use App\Models\Patient;
use App\Models\RecallTask;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class RecallsCommunicationsAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_roles_can_view_message_templates(): void
    {
        $template = MessageTemplate::factory()->create();

        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('view', $template),
                "User with role {$role->value} should be able to view templates"
            );
        }
    }

    public function test_only_privileged_users_can_create_templates(): void
    {
        $owner = User::factory()->owner()->create();
        $admin = User::factory()->admin()->create();
        $operator = User::factory()->operator()->create();

        $this->assertTrue(Gate::forUser($owner)->allows('create', MessageTemplate::class));
        $this->assertTrue(Gate::forUser($admin)->allows('create', MessageTemplate::class));
        $this->assertFalse(Gate::forUser($operator)->allows('create', MessageTemplate::class));
    }

    public function test_only_privileged_users_can_update_templates(): void
    {
        $template = MessageTemplate::factory()->create();

        $owner = User::factory()->owner()->create();
        $admin = User::factory()->admin()->create();
        $operator = User::factory()->operator()->create();

        $this->assertTrue(Gate::forUser($owner)->allows('update', $template));
        $this->assertTrue(Gate::forUser($admin)->allows('update', $template));
        $this->assertFalse(Gate::forUser($operator)->allows('update', $template));
    }

    public function test_only_admins_and_owners_can_delete_templates(): void
    {
        $template = MessageTemplate::factory()->create();

        $owner = User::factory()->owner()->create();
        $admin = User::factory()->admin()->create();
        $operator = User::factory()->operator()->create();

        $this->assertTrue(Gate::forUser($owner)->allows('delete', $template));
        $this->assertTrue(Gate::forUser($admin)->allows('delete', $template));
        $this->assertFalse(Gate::forUser($operator)->allows('delete', $template));
    }

    public function test_all_roles_can_view_recalls(): void
    {
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->create(['patient_id' => $patient->id]);

        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('view', $recall),
                "User with role {$role->value} should be able to view recalls"
            );
        }
    }

    public function test_all_roles_can_create_recalls(): void
    {
        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('create', RecallTask::class),
                "User with role {$role->value} should be able to create recalls"
            );
        }
    }

    public function test_all_roles_can_update_recalls(): void
    {
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->create(['patient_id' => $patient->id]);

        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('update', $recall),
                "User with role {$role->value} should be able to update recalls"
            );
        }
    }

    public function test_all_roles_can_record_recall_outcome(): void
    {
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->create(['patient_id' => $patient->id]);

        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('recordOutcome', $recall),
                "User with role {$role->value} should be able to record contact outcome"
            );
        }
    }

    public function test_only_admins_and_owners_can_delete_recalls(): void
    {
        $patient = Patient::factory()->create();
        $recall = RecallTask::factory()->create(['patient_id' => $patient->id]);

        $owner = User::factory()->owner()->create();
        $admin = User::factory()->admin()->create();
        $operator = User::factory()->operator()->create();

        $this->assertTrue(Gate::forUser($owner)->allows('delete', $recall));
        $this->assertTrue(Gate::forUser($admin)->allows('delete', $recall));
        $this->assertFalse(Gate::forUser($operator)->allows('delete', $recall));
    }

    public function test_all_roles_can_view_communication_logs(): void
    {
        $patient = Patient::factory()->create();
        $log = CommunicationLog::factory()->create(['patient_id' => $patient->id]);

        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('view', $log),
                "User with role {$role->value} should be able to view communication logs"
            );
        }
    }

    public function test_all_roles_can_create_communication_logs(): void
    {
        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('create', CommunicationLog::class),
                "User with role {$role->value} should be able to create communication logs"
            );
        }
    }

    public function test_all_roles_can_update_communication_logs(): void
    {
        $patient = Patient::factory()->create();
        $log = CommunicationLog::factory()->create(['patient_id' => $patient->id]);

        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('update', $log),
                "User with role {$role->value} should be able to update communication logs"
            );
        }
    }

    public function test_only_admins_and_owners_can_delete_communication_logs(): void
    {
        $patient = Patient::factory()->create();
        $log = CommunicationLog::factory()->create(['patient_id' => $patient->id]);

        $owner = User::factory()->owner()->create();
        $admin = User::factory()->admin()->create();
        $operator = User::factory()->operator()->create();

        $this->assertTrue(Gate::forUser($owner)->allows('delete', $log));
        $this->assertTrue(Gate::forUser($admin)->allows('delete', $log));
        $this->assertFalse(Gate::forUser($operator)->allows('delete', $log));
    }

    public function test_operator_crud_permissions_via_api(): void
    {
        $operator = User::factory()->operator()->create();
        $patient = Patient::factory()->create();

        $this->actingAs($operator)
            ->getJson('/api/message-templates')
            ->assertOk();

        $this->actingAs($operator)
            ->postJson('/api/message-templates', [
                'name' => 'Test',
                'channel' => 'sms',
                'body' => 'Test',
            ])
            ->assertForbidden();

        $this->actingAs($operator)
            ->getJson('/api/recalls')
            ->assertOk();

        $response = $this->actingAs($operator)
            ->postJson('/api/recalls', [
                'patient_id' => $patient->id,
                'due_date' => now()->addMonth()->toDateString(),
            ]);
        $response->assertCreated();

        $this->actingAs($operator)
            ->getJson('/api/communication-logs')
            ->assertOk();

        $response = $this->actingAs($operator)
            ->postJson('/api/communication-logs', [
                'patient_id' => $patient->id,
                'channel' => 'sms',
                'recipient' => '+39 123 456',
                'body' => 'Test message',
            ]);
        $response->assertCreated();
    }
}
