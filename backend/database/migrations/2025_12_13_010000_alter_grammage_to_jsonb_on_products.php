<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Convert integer to jsonb array for backward compatibility
        DB::statement('ALTER TABLE products ALTER COLUMN grammage TYPE jsonb USING to_jsonb(ARRAY[grammage]);');
        DB::statement('ALTER TABLE products ALTER COLUMN grammage DROP NOT NULL;');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE products ALTER COLUMN grammage TYPE integer USING (grammage)::integer;');
    }
};
