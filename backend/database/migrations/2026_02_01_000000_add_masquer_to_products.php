<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('products', 'masquer')) {
            Schema::table('products', function (Blueprint $table) {
                $table->boolean('masquer')->default(false)->index()->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'masquer')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('masquer');
            });
        }
    }
};
