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
        'grammage',
        'quantity',
    ];

    protected $casts = [
        'sizes' => 'array',
        'colors' => 'array',
        'grammage' => 'array',
        'quantity' => 'integer',
    ];
}
