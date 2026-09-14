<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scheduled_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('reminder_type', 30);
            $table->string('channel', 20);
            $table->timestamp('scheduled_for');
            $table->boolean('is_sent')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->foreignId('communication_log_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index(['scheduled_for', 'is_sent']);
            $table->index(['appointment_id', 'reminder_type']);
            $table->unique(['appointment_id', 'reminder_type', 'channel'], 'unique_reminder');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_reminders');
    }
};
