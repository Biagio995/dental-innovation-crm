<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('recall_task_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('message_template_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel', 20);
            $table->string('status', 20)->default('queued');
            $table->string('recipient', 255);
            $table->string('subject', 255)->nullable();
            $table->text('body');
            $table->string('reminder_type', 30)->nullable();
            $table->string('external_id', 255)->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['patient_id', 'created_at']);
            $table->index(['channel', 'status']);
            $table->index(['appointment_id']);
            $table->index('reminder_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_logs');
    }
};
