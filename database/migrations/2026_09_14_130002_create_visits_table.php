<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->text('treatment_notes')->nullable();
            $table->date('recommended_recall_date')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'created_at']);
            $table->index('recommended_recall_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
