<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    public const STATUSES = [
        'pending',
        'no_answer',
        'confirmed',
        'cancelled_phone',
        'delivering',
        'delivered',
        'cancelled_delivery',
    ];

    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'address',
        'products',
        'total',
        'status',
    ];

    protected $casts = [
        'products' => 'array',
        'total' => 'decimal:2',
    ];
}
