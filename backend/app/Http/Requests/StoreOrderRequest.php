<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'products' => ['required', 'array', 'min:1'],
            'products.*.product_id' => ['required', 'integer'],
            'products.*.quantity' => ['required', 'integer', 'min:1'],
            'products.*.size' => ['nullable', 'string', 'max:100'],
            'products.*.color' => ['nullable', 'string', 'max:100'],
            'products.*.sheet_measure' => ['nullable', 'string', 'max:100'],
            'products.*.pack_items' => ['nullable', 'array'],
            'products.*.pack_items.*.product_id' => ['required_with:products.*.pack_items', 'integer'],
            'products.*.pack_items.*.quantity' => ['nullable', 'integer', 'min:1'],
            'products.*.pack_items.*.color' => ['nullable', 'string', 'max:100'],
            'products.*.pack_items.*.sheet_measure' => ['nullable', 'string', 'max:100'],
            'products.*.is_pack' => ['nullable', 'boolean'],
            'total' => ['required', 'numeric', 'min:0'],
        ];
    }
}
