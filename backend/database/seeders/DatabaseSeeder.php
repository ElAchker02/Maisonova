<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Pack;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with an admin user and sample catalog data.
     */
    public function run(): void
    {
        $adminEmail = 'admin@ecom.test';

        User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin123'),
                'role' => 'superadmin',
            ]
        );

        $products = [
            [
                'title' => 'Drap de bain coton',
                'description' => 'Drap de bain doux 100% coton.',
                'price' => 89.99,
                'promotion' => 15,
                'images' => [
                    'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800',
                ],
                'sizes' => ['70x140 cm', '100x150 cm'],
                'sheet_measures' => ['90x190x35 cm', '140x200x35 cm'],
                'colors' => [['name' => 'Blanc', 'hex' => '#FFFFFF'], ['name' => 'Gris', 'hex' => '#808080']],
                'grammage' => [600],
                'stock' => 50,
                'status' => true,
                'category' => 'Linge de bain',
            ],
            [
                'title' => 'Parure de lit satin',
                'description' => 'Parure satin 400 fils.',
                'price' => 249.99,
                'promotion' => 10,
                'images' => [
                    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
                ],
                'sizes' => ['200x200 cm', '240x220 cm', '260x240 cm'],
                'sheet_measures' => ['160x200x35 cm', '180x200x35 cm'],
                'colors' => [['name' => 'Blanc', 'hex' => '#FFFFFF'], ['name' => 'Champagne', 'hex' => '#F7E7CE']],
                'grammage' => [400],
                'stock' => 35,
                'status' => true,
                'category' => 'Linge de lit',
            ],
            [
                'title' => 'Serviette bambou',
                'description' => 'Serviette hypoallergenique fibre de bambou.',
                'price' => 34.99,
                'promotion' => 0,
                'images' => [
                    'https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=800',
                ],
                'sizes' => ['30x50 cm', '50x100 cm'],
                'sheet_measures' => [],
                'colors' => [['name' => 'Beige', 'hex' => '#F5F5DC'], ['name' => 'Vert', 'hex' => '#9DC183']],
                'grammage' => [450],
                'stock' => 80,
                'status' => true,
                'category' => 'Linge de bain',
            ],
            [
                'title' => 'Taie oreiller percale',
                'description' => 'Taie percale 200 fils.',
                'price' => 29.99,
                'promotion' => 5,
                'images' => [
                    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800',
                ],
                'sizes' => ['50x70 cm', '65x65 cm'],
                'sheet_measures' => [],
                'colors' => [['name' => 'Blanc', 'hex' => '#FFFFFF'], ['name' => 'Rose', 'hex' => '#E8C4C4']],
                'grammage' => [200],
                'stock' => 60,
                'status' => true,
                'category' => 'Linge de lit',
            ],
        ];

        $productIds = [];
        foreach ($products as $data) {
            $product = Product::updateOrCreate(
                ['slug' => Str::slug($data['title'])],
                array_merge($data, ['slug' => Str::slug($data['title'])])
            );
            $productIds[$product->slug] = $product->id;
        }

        $packs = [
            [
                'title' => 'Pack salle de bain',
                'description' => 'Ensemble draps et serviettes.',
                'price' => 199.99,
                'promotion' => 20,
                'images' => [
                    'https://images.unsplash.com/photo-1620127682229-33388276e540?w=800',
                ],
                'availability' => true,
                'products' => [
                    [
                        'slug' => 'drap-de-bain-coton',
                        'quantity' => 2,
                        'sizes' => ['70x140 cm'],
                        'colors' => [['name' => 'Blanc', 'hex' => '#FFFFFF']],
                        'grammage' => 600,
                    ],
                    [
                        'slug' => 'serviette-bambou',
                        'quantity' => 2,
                        'sizes' => ['50x100 cm'],
                        'colors' => [['name' => 'Beige', 'hex' => '#F5F5DC']],
                        'grammage' => 450,
                    ],
                ],
            ],
            [
                'title' => 'Pack chambre premium',
                'description' => 'Parure + taies assorties.',
                'price' => 329.99,
                'promotion' => 15,
                'images' => [
                    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
                ],
                'availability' => true,
                'products' => [
                    [
                        'slug' => 'parure-de-lit-satin',
                        'quantity' => 1,
                        'sizes' => ['240x220 cm'],
                        'colors' => [['name' => 'Blanc', 'hex' => '#FFFFFF']],
                        'grammage' => 400,
                    ],
                    [
                        'slug' => 'taie-oreiller-percale',
                        'quantity' => 2,
                        'sizes' => ['65x65 cm'],
                        'colors' => [['name' => 'Rose', 'hex' => '#E8C4C4']],
                        'grammage' => 200,
                    ],
                ],
            ],
        ];

        foreach ($packs as $packData) {
            $productsData = $packData['products'];
            unset($packData['products']);

            $pack = Pack::updateOrCreate(
                ['slug' => Str::slug($packData['title'])],
                array_merge($packData, ['slug' => Str::slug($packData['title'])])
            );

            $sync = [];
            foreach ($productsData as $pd) {
                $slug = $pd['slug'];
                if (!isset($productIds[$slug])) {
                    continue;
                }
                $sync[$productIds[$slug]] = [
                    'quantity' => $pd['quantity'] ?? 1,
                    'sizes' => $pd['sizes'] ?? null,
                    'colors' => $pd['colors'] ?? null,
                    'grammage' => $pd['grammage'] ?? null,
                ];
            }

            if (!empty($sync)) {
                $pack->products()->sync($sync);
            }
        }

        $firstProductId = reset($productIds);

        if ($firstProductId) {
            Order::create([
                'full_name' => 'Client Demo',
                'phone' => '+2250700000000',
                'email' => 'demo@mainsonova.com',
                'address' => 'Abidjan, Plateau',
                'products' => [
                    ['product_id' => $firstProductId, 'quantity' => 2, 'size' => '70x140 cm', 'color' => 'Blanc'],
                ],
                'total' => 2 * (Product::find($firstProductId)?->final_price ?? 0),
                'status' => 'confirmed',
            ]);
        }
    }
}
