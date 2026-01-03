<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:packs,slug'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'promotion' => ['nullable', 'numeric', 'between:0,100'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:4096'],
            'colors' => ['sometimes', 'array'],
            'colors.*' => ['string', 'max:50'],
            'measure_prices' => ['sometimes', 'array'],
            'measure_prices.*.measure' => ['required_with:measure_prices', 'string', 'max:255'],
            'measure_prices.*.price' => ['required_with:measure_prices', 'numeric', 'min:0'],
            'availability' => ['required', 'boolean'],
            'products' => ['nullable', 'array'],
            'products.*.product_id' => ['required_with:products', 'exists:products,id'],
            'products.*.quantity' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
