<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL: add new enum value for orders.status
        DB::statement("ALTER TYPE orders_status_enum ADD VALUE IF NOT EXISTS 'pending';");
    }

    public function down(): void
    {
        // Can't easily remove enum values in PostgreSQL; leave as-is
    }
};
