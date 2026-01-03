<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('packs', 'slug')->ignore($this->route('pack')),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'promotion' => ['sometimes', 'numeric', 'between:0,100'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['image', 'max:4096'],
            'colors' => ['sometimes', 'array'],
            'colors.*' => ['string', 'max:50'],
            'measure_prices' => ['sometimes', 'array'],
            'measure_prices.*.measure' => ['required_with:measure_prices', 'string', 'max:255'],
            'measure_prices.*.price' => ['required_with:measure_prices', 'numeric', 'min:0'],
            'availability' => ['sometimes', 'boolean'],
            'products' => ['sometimes', 'array'],
            'products.*.product_id' => ['required_with:products', 'exists:products,id'],
            'products.*.quantity' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
