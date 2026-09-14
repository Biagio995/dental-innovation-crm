<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@dental.local',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@dental.local',
            'password' => 'password123',
        ]);

        $response->assertNoContent();
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@dental.local',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@dental.local',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
        $this->assertGuest();
    }

    public function test_login_fails_with_nonexistent_user(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@dental.local',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_login_validation_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create([
            'email' => 'test@dental.local',
            'password' => bcrypt('password123'),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'test@dental.local',
                'password' => 'wrongpassword',
            ]);
        }

        $response = $this->postJson('/api/login', [
            'email' => 'test@dental.local',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
        $this->assertStringContainsString(
            'Too many login attempts',
            $response->json('errors.email.0')
        );
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')
            ->postJson('/api/logout');

        $response->assertNoContent();
    }

    public function test_logout_requires_authentication(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertUnauthorized();
    }

    public function test_me_returns_user_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@dental.local',
            'role' => UserRole::Admin,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/me');

        $response->assertOk();
        $response->assertExactJson([
            'id' => $user->id,
            'name' => 'Test User',
            'email' => 'test@dental.local',
            'role' => 'admin',
        ]);
    }

    public function test_me_returns_401_without_authentication(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertUnauthorized();
    }

    public function test_me_returns_correct_role_for_each_user_type(): void
    {
        $owner = User::factory()->owner()->create();
        $admin = User::factory()->admin()->create();
        $operator = User::factory()->operator()->create();

        $this->actingAs($owner)
            ->getJson('/api/me')
            ->assertJson(['role' => 'owner']);

        $this->actingAs($admin)
            ->getJson('/api/me')
            ->assertJson(['role' => 'admin']);

        $this->actingAs($operator)
            ->getJson('/api/me')
            ->assertJson(['role' => 'operator']);
    }

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('test@dental.local|127.0.0.1');
    }
}
