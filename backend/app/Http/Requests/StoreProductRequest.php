<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'promotion' => ['nullable', 'numeric', 'between:0,100'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:4096'],
            'sizes' => ['nullable', 'array'],
            'sheet_measures' => ['nullable', 'array'],
            'colors' => ['nullable', 'array'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'boolean'],
        ];
    }
}
