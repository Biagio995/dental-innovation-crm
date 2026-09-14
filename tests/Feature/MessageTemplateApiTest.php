<?php

namespace Tests\Feature;

use App\Enums\CommunicationChannel;
use App\Enums\UserRole;
use App\Models\MessageTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageTemplateApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_message_templates(): void
    {
        $user = User::factory()->create();
        MessageTemplate::factory()->count(3)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/message-templates');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'channel',
                    'subject',
                    'body',
                    'variables',
                    'is_active',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }

    public function test_can_filter_templates_by_channel(): void
    {
        $user = User::factory()->create();
        MessageTemplate::factory()->sms()->count(2)->create();
        MessageTemplate::factory()->email()->count(3)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/message-templates?channel=sms');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_can_filter_active_only_templates(): void
    {
        $user = User::factory()->create();
        MessageTemplate::factory()->count(2)->create(['is_active' => true]);
        MessageTemplate::factory()->inactive()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/message-templates?active_only=true');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_message_template(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)
            ->postJson('/api/message-templates', [
                'name' => 'Test SMS Template',
                'channel' => 'sms',
                'body' => 'Hello {nome}, your appointment is on {data}.',
                'variables' => ['nome', 'data'],
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.name', 'Test SMS Template');
        $response->assertJsonPath('data.channel', 'sms');

        $this->assertDatabaseHas('message_templates', [
            'name' => 'Test SMS Template',
            'channel' => 'sms',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'message_template_created',
            'user_id' => $admin->id,
        ]);
    }

    public function test_operator_cannot_create_message_template(): void
    {
        $operator = User::factory()->operator()->create();

        $response = $this->actingAs($operator)
            ->postJson('/api/message-templates', [
                'name' => 'Test Template',
                'channel' => 'sms',
                'body' => 'Hello {nome}!',
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_message_template(): void
    {
        $admin = User::factory()->admin()->create();
        $template = MessageTemplate::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($admin)
            ->putJson("/api/message-templates/{$template->id}", [
                'name' => 'New Name',
                'body' => 'Updated body text',
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.name', 'New Name');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'message_template_updated',
            'user_id' => $admin->id,
        ]);
    }

    public function test_operator_cannot_update_message_template(): void
    {
        $operator = User::factory()->operator()->create();
        $template = MessageTemplate::factory()->create();

        $response = $this->actingAs($operator)
            ->putJson("/api/message-templates/{$template->id}", [
                'name' => 'New Name',
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_delete_message_template(): void
    {
        $admin = User::factory()->admin()->create();
        $template = MessageTemplate::factory()->create();

        $response = $this->actingAs($admin)
            ->deleteJson("/api/message-templates/{$template->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted('message_templates', ['id' => $template->id]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'message_template_deleted',
            'user_id' => $admin->id,
        ]);
    }

    public function test_operator_cannot_delete_message_template(): void
    {
        $operator = User::factory()->operator()->create();
        $template = MessageTemplate::factory()->create();

        $response = $this->actingAs($operator)
            ->deleteJson("/api/message-templates/{$template->id}");

        $response->assertForbidden();
    }

    public function test_can_preview_template(): void
    {
        $user = User::factory()->create();
        $template = MessageTemplate::factory()->create([
            'channel' => CommunicationChannel::Sms,
            'body' => 'Hello {nome}, your appointment is on {data} at {ora}.',
        ]);

        $response = $this->actingAs($user)
            ->postJson("/api/message-templates/{$template->id}/preview", [
                'data' => [
                    'nome' => 'Mario',
                    'data' => '01/01/2025',
                    'ora' => '10:00',
                ],
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.body', 'Hello Mario, your appointment is on 01/01/2025 at 10:00.');
    }

    public function test_template_validation_requires_name_and_body(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)
            ->postJson('/api/message-templates', [
                'channel' => 'sms',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['name', 'body']);
    }

    public function test_template_validation_requires_valid_channel(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)
            ->postJson('/api/message-templates', [
                'name' => 'Test',
                'channel' => 'whatsapp',
                'body' => 'Test body',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['channel']);
    }
}
