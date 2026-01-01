<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Pack extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'price',
        'promotion',
        'images',
        'availability',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'promotion' => 'decimal:2',
        'images' => 'array',
        'availability' => 'boolean',
    ];

    protected $appends = [
        'final_price',
    ];

    protected static function booted(): void
    {
        static::creating(function (Pack $pack): void {
            if (empty($pack->slug)) {
                $pack->slug = Str::slug($pack->title);
            }
        });
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)
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
