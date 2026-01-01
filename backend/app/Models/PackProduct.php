<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PackProduct extends Pivot
{
    protected $table = 'pack_product';

    protected $fillable = [
        'pack_id',
        'product_id',
        'sizes',
        'colors',
        'quantity',
    ];

    protected $casts = [
        'sizes' => 'array',
        'colors' => 'array',
        'quantity' => 'integer',
    ];
}
