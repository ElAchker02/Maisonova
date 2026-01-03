<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Product */
class ProductResource extends JsonResource
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
            'category' => $this->category,
            'price' => (float) $this->price,
            'promotion' => $this->promotion !== null ? (float) $this->promotion : null,
            'final_price' => $this->final_price,
            'images' => $this->normalizeImages($this->images ?? []),
            'sizes' => $this->sizes ?? [],
            'sheet_measures' => $this->sheet_measures ?? [],
            'colors' => $this->colors ?? [],
            'stock' => $this->stock,
            'status' => (bool) $this->status,
            'masquer' => (bool) ($this->masquer ?? false),
            'sales_quantity' => $this->when(isset($this->sales_quantity), (int) $this->sales_quantity),
            'packs' => $this->whenLoaded('packs', fn () => $this->packs->map(fn ($pack) => [
                'id' => $pack->id,
                'title' => $pack->title,
                'slug' => $pack->slug,
                'pivot' => $pack->pivot ? [
                    'sizes' => $pack->pivot->sizes,
                    'colors' => $pack->pivot->colors,
                    'quantity' => $pack->pivot->quantity,
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
        $host = parse_url(config('app.url') ?? '', PHP_URL_HOST);

        return collect($images)->map(function ($img) use ($host) {
            if (!is_string($img)) {
                return $img;
            }
            if (filter_var($img, FILTER_VALIDATE_URL)) {
                $parts = parse_url($img);
                $path = ($parts['path'] ?? '') . (isset($parts['query']) ? '?' . $parts['query'] : '');
                // Normalize /storage/public/... -> /storage/...
                $path = str_replace('/storage/public/', '/storage/', $path);
                return $path ?: $img;
            }
            $img = str_replace('/storage/public/', '/storage/', $img);
            return $img;
        })->values()->all();
    }
}
