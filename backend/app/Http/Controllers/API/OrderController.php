<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Pack;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 20), 100);
        $orders = Order::latest()->paginate($perPage);

        return OrderResource::collection($orders)
            ->additional([
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ],
            ])
            ->response();
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();
            $cart = $data['products'];

            $computedTotal = collect($cart)->sum(function (array $item) {
                if (!empty($item['is_pack'])) {
                    $pack = Pack::with('products')->findOrFail($item['product_id']);
                    return $pack->final_price * $item['quantity'];
                }

                $product = Product::findOrFail($item['product_id']);
                return $product->final_price * $item['quantity'];
            });

            if (abs($data['total'] - $computedTotal) > 0.01) {
                throw new \RuntimeException('Totals mismatch');
            }

            $order = Order::create([
                'full_name' => $data['full_name'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'address' => $data['address'],
                'products' => $cart,
                'total' => $computedTotal,
                'status' => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully',
                'data' => new OrderResource($order),
            ], 201);
        } catch (\Throwable $exception) {
            DB::rollBack();

            return response()->json([
                'message' => 'Unable to place order',
                'error' => $exception->getMessage(),
            ], 422);
        }
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:50'],
            'address' => ['sometimes', 'string', 'max:500'],
            'status' => ['sometimes', Rule::in(Order::STATUSES)],
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order updated successfully',
            'data' => new OrderResource($order),
        ]);
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully',
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Order::STATUSES)],
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Order status updated',
            'data' => new OrderResource($order),
        ]);
    }
}
