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
            'availability' => ['required', 'boolean'],
            'products' => ['nullable', 'array'],
            'products.*.product_id' => ['required_with:products', 'exists:products,id'],
            'products.*.sheet_measures' => ['nullable', 'array'],
            'products.*.sheet_measures.*' => ['string', 'max:100'],
            'products.*.colors' => ['nullable', 'array'],
            'products.*.colors.*' => ['string', 'max:100'],
            'products.*.quantity' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
