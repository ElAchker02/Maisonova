<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePackRequest;
use App\Http\Requests\UpdatePackRequest;
use App\Http\Resources\PackResource;
use App\Models\Pack;
use App\Models\Product;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PackController extends Controller
{
    public function __construct(private ImageUploadService $uploader)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 15), 50);
        $packs = Pack::with('products')->paginate($perPage);

        return PackResource::collection($packs)
            ->additional([
                'meta' => [
                    'current_page' => $packs->currentPage(),
                    'per_page' => $packs->perPage(),
                    'total' => $packs->total(),
                ],
            ])
            ->response();
    }

    public function store(StorePackRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();
            $products = $data['products'] ?? [];
            unset($data['products']);

            if ($request->hasFile('images')) {
                $data['images'] = $this->uploader->upload($request->file('images'), 'packs');
            }

            $pack = Pack::create($data);

            $this->syncPackProducts($pack, $products);

            DB::commit();

            return response()->json([
                'message' => 'Pack created successfully',
                'data' => new PackResource($pack->load('products')),
            ], 201);
        } catch (\Throwable $exception) {
            DB::rollBack();
            Log::error('PACK_CREATE_FAILED', ['error' => $exception->getMessage()]);

            return response()->json([
                'message' => 'Unable to create pack',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function show(Pack $pack): JsonResponse
    {
        return response()->json([
            'data' => new PackResource($pack->load('products')),
        ]);
    }

    public function update(UpdatePackRequest $request, Pack $pack): JsonResponse
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();
            $products = $data['products'] ?? null;
            unset($data['products']);

            if ($request->hasFile('images')) {
                $data['images'] = $this->uploader->upload($request->file('images'), 'packs');
            }

            $pack->update($data);

            if ($products !== null) {
                $pack->products()->detach();
                $this->syncPackProducts($pack, $products);
            }

            DB::commit();

            return response()->json([
                'message' => 'Pack updated successfully',
                'data' => new PackResource($pack->fresh()->load('products')),
            ]);
        } catch (\Throwable $exception) {
            DB::rollBack();
            Log::error('PACK_UPDATE_FAILED', ['error' => $exception->getMessage()]);

            return response()->json([
                'message' => 'Unable to update pack',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function destroy(Pack $pack): JsonResponse
    {
        $pack->delete();

        return response()->json([
            'message' => 'Pack deleted successfully',
        ]);
    }

    public function addProductToPack(Request $request, Pack $pack): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
                'sizes' => ['nullable', 'array'],
                'colors' => ['nullable', 'array'],
                'quantity' => ['required', 'integer', 'min:1'],
            ]);

            $pack->products()->syncWithoutDetaching([
                $validated['product_id'] => [
                    'sizes' => $validated['sizes'] ?? null,
                    'colors' => $validated['colors'] ?? null,
                    'quantity' => $validated['quantity'],
                ],
            ]);

            return response()->json([
                'message' => 'Product added to pack',
                'data' => new PackResource($pack->fresh()->load('products')),
            ]);
        } catch (\Throwable $exception) {
            Log::error('PACK_ADD_PRODUCT_FAILED', ['error' => $exception->getMessage()]);

            return response()->json([
                'message' => 'Unable to add product to pack',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    public function removeProductFromPack(Pack $pack, Product $product): JsonResponse
    {
        try {
            $pack->products()->detach($product->id);

            return response()->json([
                'message' => 'Product removed from pack',
                'data' => new PackResource($pack->fresh()->load('products')),
            ]);
        } catch (\Throwable $exception) {
            Log::error('PACK_REMOVE_PRODUCT_FAILED', ['error' => $exception->getMessage()]);

            return response()->json([
                'message' => 'Unable to remove product from pack',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    private function syncPackProducts(Pack $pack, array $products): void
    {
        if (empty($products)) {
            return;
        }

        $syncData = [];

        foreach ($products as $product) {
            $syncData[$product['product_id']] = [
                'quantity' => $product['quantity'] ?? 1,
            ];
        }

        $pack->products()->sync($syncData);
    }
}
