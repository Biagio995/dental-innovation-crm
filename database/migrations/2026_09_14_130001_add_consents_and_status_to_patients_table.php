<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->jsonb('consents')->nullable()->after('notes');
            $table->string('status', 20)->default('active')->after('consents');

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn(['consents', 'status']);
        });
    }
};
