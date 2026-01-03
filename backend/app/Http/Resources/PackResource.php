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
            'images' => $this->normalizeImages($this->images ?? []),
            'availability' => (bool) $this->availability,
            'products' => $this->whenLoaded('products', fn () => $this->products->map(fn ($product) => [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'price' => (float) $product->price,
                'final_price' => $product->final_price,
                'images' => $this->normalizeImages($product->images ?? []),
                'sizes' => $product->sizes ?? [],
                'sheet_measures' => $product->sheet_measures ?? [],
                'colors' => $product->colors ?? [],
                'pivot' => $product->pivot ? [
                    'sizes' => $product->pivot->sizes,
                    'sheet_measures' => $product->pivot->sizes,
                    'colors' => $product->pivot->colors,
                    'quantity' => $product->pivot->quantity,
                ] : null,
            ])),
            'created_at' => $this->created_at,
        ];
    }

    /**
     * @param array<int,string> $images
     * @return array<int,string>
     */
    protected function normalizeImages(array $images): array
    {
        return collect($images)->map(function ($img) {
            if (!is_string($img)) {
                return $img;
            }
            if (filter_var($img, FILTER_VALIDATE_URL)) {
                $parts = parse_url($img);
                $path = ($parts['path'] ?? '') . (isset($parts['query']) ? '?' . $parts['query'] : '');
                $path = str_replace('/storage/public/', '/storage/', $path);
                return $path ?: $img;
            }
            $img = str_replace('/storage/public/', '/storage/', $img);
            return $img;
        })->values()->all();
    }
}
