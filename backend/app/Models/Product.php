<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'category',
        'price',
        'promotion',
        'images',
        'sizes',
        'sheet_measures',
        'colors',
        'stock',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'promotion' => 'decimal:2',
        'images' => 'array',
        'sizes' => 'array',
        'sheet_measures' => 'array',
        'colors' => 'array',
        'stock' => 'integer',
        'status' => 'boolean',
    ];

    protected $appends = [
        'final_price',
    ];

    protected static function booted(): void
    {
        static::creating(function (Product $product): void {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->title);
            }
        });
    }

    public function packs()
    {
        return $this->belongsToMany(Pack::class)
            ->using(PackProduct::class)
            ->withPivot(['sizes', 'colors', 'quantity'])
            ->withTimestamps();
    }

    public function getFinalPriceAttribute(): float
    {
        if (!$this->promotion) {
            return (float) $this->price;
        }

        return (float) ($this->price - ($this->price * ($this->promotion / 100)));
    }
}
