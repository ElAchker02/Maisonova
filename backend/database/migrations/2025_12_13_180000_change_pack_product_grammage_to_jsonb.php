<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('pack_product') && Schema::hasColumn('pack_product', 'grammage')) {
            DB::statement("ALTER TABLE pack_product ALTER COLUMN grammage TYPE jsonb USING to_jsonb(grammage)");
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('pack_product') && Schema::hasColumn('pack_product', 'grammage')) {
            DB::statement("ALTER TABLE pack_product ALTER COLUMN grammage TYPE integer USING (grammage::text)::integer");
        }
    }
};
