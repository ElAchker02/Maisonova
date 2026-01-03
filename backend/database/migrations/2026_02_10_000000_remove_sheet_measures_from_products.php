<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('products', 'sheet_measures')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('sheet_measures');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('products', 'sheet_measures')) {
            Schema::table('products', function (Blueprint $table) {
                $table->jsonb('sheet_measures')->nullable()->after('sizes');
            });
        }
    }
};
