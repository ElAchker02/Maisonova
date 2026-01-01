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
            'availability' => ['sometimes', 'boolean'],
            'products' => ['sometimes', 'array'],
            'products.*.product_id' => ['required_with:products', 'exists:products,id'],
            'products.*.sheet_measures' => ['nullable', 'array'],
            'products.*.sheet_measures.*' => ['string', 'max:100'],
            'products.*.colors' => ['nullable', 'array'],
            'products.*.colors.*' => ['string', 'max:100'],
            'products.*.quantity' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
