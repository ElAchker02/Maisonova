<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique()->index();
            $table->text('description')->nullable();
            $table->string('category')->nullable()->index();
            $table->decimal('price', 10, 2);
            $table->decimal('promotion', 5, 2)->default(0);
            $table->jsonb('images')->nullable();
            $table->jsonb('sizes')->nullable();
            $table->jsonb('colors')->nullable();
            $table->integer('grammage')->nullable();
            $table->integer('stock')->default(0);
            $table->boolean('status')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
