<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Pack */
class PackResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'promotion' => $this->promotion !== null ? (float) $this->promotion : null,
            'final_price' => $this->final_price,
            'images' => $this->images ?? [],
            'availability' => (bool) $this->availability,
            'products' => $this->whenLoaded('products', fn () => $this->products->map(fn ($product) => [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'price' => (float) $product->price,
                'final_price' => $product->final_price,
                'images' => $product->images ?? [],
                'sizes' => $product->sizes ?? [],
                'sheet_measures' => $product->sheet_measures ?? [],
                'colors' => $product->colors ?? [],
                'grammage' => $product->grammage ?? [],
                'pivot' => $product->pivot ? [
                    'sizes' => $product->pivot->sizes,
                    'sheet_measures' => $product->pivot->sizes,
                    'colors' => $product->pivot->colors,
                    'grammage' => $product->pivot->grammage,
                    'quantity' => $product->pivot->quantity,
                ] : null,
            ])),
            'created_at' => $this->created_at,
        ];
    }
}
