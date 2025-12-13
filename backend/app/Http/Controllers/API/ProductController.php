<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Product;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    public function __construct(private ImageUploadService $uploader)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 20), 50);
        $products = Product::with('packs')->latest()->paginate($perPage);

        return ProductResource::collection($products)
            ->additional([
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                ],
            ])
            ->response();
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $data['stock'] = $data['stock'] ?? 0;

            if ($request->hasFile('images')) {
                $data['images'] = $this->uploader->upload($request->file('images'));
            }

            $product = Product::create($data);

            return response()->json([
                'message' => 'Product created successfully',
                'data' => new ProductResource($product),
            ], 201);
        } catch (\Throwable $exception) {
            Log::error('PRODUCT_CREATE_FAILED', ['error' => $exception->getMessage()]);

            return response()->json([
                'message' => 'Unable to create product',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('packs');

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        try {
            $data = $request->validated();

            if (!array_key_exists('stock', $data)) {
                $data['stock'] = $product->stock;
            }

            if ($request->hasFile('images')) {
                $data['images'] = $this->uploader->upload($request->file('images'));
            }

            $product->update($data);

            return response()->json([
                'message' => 'Product updated successfully',
                'data' => new ProductResource($product->fresh('packs')),
            ]);
        } catch (\Throwable $exception) {
            Log::error('PRODUCT_UPDATE_FAILED', ['error' => $exception->getMessage()]);

            return response()->json([
                'message' => 'Unable to update product',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    public function topSales(): JsonResponse
    {
        $startOfMonth = now()->startOfMonth();

        $orders = Order::whereBetween('created_at', [$startOfMonth, now()])->get();

        $sales = $orders->flatMap(fn (Order $order) => $order->products)
            ->groupBy('product_id')
            ->map(fn (Collection $items) => [
                'quantity' => $items->sum('quantity'),
            ])
            ->sortByDesc('quantity')
            ->take(10);

        $products = Product::whereIn('id', $sales->keys())->get()
            ->map(function (Product $product) use ($sales) {
                $product->sales_quantity = $sales[$product->id]['quantity'] ?? 0;
                return $product;
            })
            ->sortByDesc('sales_quantity')
            ->values();

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'period' => $startOfMonth->toDateString(),
                'count' => $products->count(),
            ],
        ]);
    }

    public function related(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $query = Product::query()
            ->whereKeyNot($product->id)
            ->where('status', true)
            ->when($product->category, fn ($q) => $q->where('category', $product->category))
            ->when($product->colors, function ($q) use ($product) {
                $firstColor = $product->colors[0] ?? null;
                if ($firstColor) {
                    $q->whereJsonContains('colors', $firstColor);
                }
            })
            ->when($product->sizes, function ($q) use ($product) {
                $firstSize = $product->sizes[0] ?? null;
                if ($firstSize) {
                    $q->orWhereJsonContains('sizes', $firstSize);
                }
            })
            ->limit(6)
            ->get();

        return response()->json([
            'data' => ProductResource::collection($query),
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = Product::whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json([
            'data' => $categories,
        ]);
    }
}
