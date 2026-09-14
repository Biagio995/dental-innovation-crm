<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recall_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained()->nullOnDelete();
            $table->date('due_date');
            $table->string('status', 20)->default('pending');
            $table->text('notes')->nullable();
            $table->unsignedInteger('contact_attempts')->default(0);
            $table->timestamp('last_contact_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('resulting_appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'due_date']);
            $table->index(['patient_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recall_tasks');
    }
};
