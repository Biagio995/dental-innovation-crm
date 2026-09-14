<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_delete_patient(): void
    {
        $owner = User::factory()->owner()->create();
        $patient = Patient::factory()->create();

        $this->assertTrue(Gate::forUser($owner)->allows('delete', $patient));
    }

    public function test_admin_can_delete_patient(): void
    {
        $admin = User::factory()->admin()->create();
        $patient = Patient::factory()->create();

        $this->assertTrue(Gate::forUser($admin)->allows('delete', $patient));
    }

    public function test_operator_cannot_delete_patient(): void
    {
        $operator = User::factory()->operator()->create();
        $patient = Patient::factory()->create();

        $this->assertFalse(Gate::forUser($operator)->allows('delete', $patient));
    }

    public function test_owner_can_delete_appointment(): void
    {
        $owner = User::factory()->owner()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        $this->assertTrue(Gate::forUser($owner)->allows('delete', $appointment));
    }

    public function test_admin_can_delete_appointment(): void
    {
        $admin = User::factory()->admin()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        $this->assertTrue(Gate::forUser($admin)->allows('delete', $appointment));
    }

    public function test_operator_cannot_delete_appointment(): void
    {
        $operator = User::factory()->operator()->create();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        $this->assertFalse(Gate::forUser($operator)->allows('delete', $appointment));
    }

    public function test_all_roles_can_view_patients(): void
    {
        $patient = Patient::factory()->create();

        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('view', $patient),
                "User with role {$role->value} should be able to view patients"
            );
        }
    }

    public function test_all_roles_can_create_patients(): void
    {
        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('create', Patient::class),
                "User with role {$role->value} should be able to create patients"
            );
        }
    }

    public function test_all_roles_can_update_patients(): void
    {
        $patient = Patient::factory()->create();

        foreach ([UserRole::Owner, UserRole::Admin, UserRole::Operator] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->assertTrue(
                Gate::forUser($user)->allows('update', $patient),
                "User with role {$role->value} should be able to update patients"
            );
        }
    }

    public function test_only_owner_can_force_delete_patient(): void
    {
        $patient = Patient::factory()->create();

        $owner = User::factory()->owner()->create();
        $admin = User::factory()->admin()->create();
        $operator = User::factory()->operator()->create();

        $this->assertTrue(Gate::forUser($owner)->allows('forceDelete', $patient));
        $this->assertFalse(Gate::forUser($admin)->allows('forceDelete', $patient));
        $this->assertFalse(Gate::forUser($operator)->allows('forceDelete', $patient));
    }

    public function test_privileged_users_can_restore_patient(): void
    {
        $patient = Patient::factory()->create();
        $patient->delete();

        $owner = User::factory()->owner()->create();
        $admin = User::factory()->admin()->create();
        $operator = User::factory()->operator()->create();

        $this->assertTrue(Gate::forUser($owner)->allows('restore', $patient));
        $this->assertTrue(Gate::forUser($admin)->allows('restore', $patient));
        $this->assertFalse(Gate::forUser($operator)->allows('restore', $patient));
    }
}
