<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
                Rule::unique('products', 'slug')->ignore($this->route('product')),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
            'category' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'promotion' => ['sometimes', 'numeric', 'between:0,100'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['image', 'max:4096'],
            'sizes' => ['sometimes', 'nullable', 'array'],
            'measure_prices' => ['sometimes', 'array'],
            'measure_prices.*.measure' => ['required_with:measure_prices', 'string', 'max:255'],
            'measure_prices.*.price' => ['required_with:measure_prices', 'numeric', 'min:0'],
            'colors' => ['sometimes', 'nullable', 'array'],
            'stock' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'boolean'],
            'masquer' => ['sometimes', 'boolean'],
        ];
    }
}
