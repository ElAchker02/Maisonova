<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('products', 'measure_prices')) {
            Schema::table('products', function (Blueprint $table) {
                $table->jsonb('measure_prices')->nullable()->after('sheet_measures');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'measure_prices')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('measure_prices');
            });
        }
    }
};
