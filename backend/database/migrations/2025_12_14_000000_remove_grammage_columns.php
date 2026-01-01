<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('products', 'grammage')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('grammage');
            });
        }

        if (Schema::hasColumn('pack_product', 'grammage')) {
            Schema::table('pack_product', function (Blueprint $table) {
                $table->dropColumn('grammage');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('products', 'grammage')) {
            Schema::table('products', function (Blueprint $table) {
                $table->jsonb('grammage')->nullable();
            });
        }

        if (!Schema::hasColumn('pack_product', 'grammage')) {
            Schema::table('pack_product', function (Blueprint $table) {
                $table->jsonb('grammage')->nullable();
            });
        }
    }
};
