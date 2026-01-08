<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Pack;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function overview(): JsonResponse
    {
        // Cache léger pour éviter de recalculer trop souvent
        $stats = Cache::remember('dashboard_overview', 10, function () {
            $orders = Order::orderByDesc('created_at')->get();
            $products = Product::select('id', 'title', 'price', 'promotion', 'status')->get()->map(function ($p) {
                $final = $p->price;
                if ($p->promotion) {
                    $final = $p->price - ($p->price * ($p->promotion / 100));
                }
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'final_price' => (float) $final,
                    'status' => (bool) $p->status,
                ];
            })->keyBy('id');

            $packs = Pack::select('id', 'title', 'price', 'promotion', 'availability')->get()->map(function ($p) {
                $final = $p->price;
                if ($p->promotion) {
                    $final = $p->price - ($p->price * ($p->promotion / 100));
                }
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'final_price' => (float) $final,
                    'availability' => (bool) $p->availability,
                ];
            })->keyBy('id');

            $now = Carbon::now();
            $dayStart = $now->copy()->startOfDay();
            $weekStart = $now->copy()->startOfWeek(Carbon::MONDAY);
            $monthStart = $now->copy()->startOfMonth();

            $inPeriod = function ($date, Carbon $start) {
                return Carbon::parse($date)->greaterThanOrEqualTo($start);
            };

            $revenueDay = $orders->where('created_at', '>=', $dayStart)->sum('total');
            $revenueWeek = $orders->where('created_at', '>=', $weekStart)->sum('total');
            $revenueMonth = $orders->where('created_at', '>=', $monthStart)->sum('total');

            $ordersDay = $orders->filter(fn ($o) => $inPeriod($o->created_at, $dayStart))->count();
            $ordersWeek = $orders->filter(fn ($o) => $inPeriod($o->created_at, $weekStart))->count();
            $ordersMonth = $orders->filter(fn ($o) => $inPeriod($o->created_at, $monthStart))->count();

            $statusBuckets = [
                'pending' => 0,
                'no_answer' => 0,
                'confirmed' => 0,
                'delivering' => 0,
                'delivered' => 0,
                'cancelled' => 0,
            ];

            $items = [];

            foreach ($orders as $order) {
                $status = $order->status;
                if (array_key_exists($status, $statusBuckets)) {
                    $statusBuckets[$status] += 1;
                } elseif (in_array($status, ['cancelled_phone', 'cancelled_delivery'], true)) {
                    $statusBuckets['cancelled'] += 1;
                }

                foreach ($order->products as $p) {
                    $isPack = !empty($p['is_pack']);
                    $id = (int) ($p['product_id'] ?? 0);
                    $quantity = (int) ($p['quantity'] ?? 1);

                    if ($isPack) {
                        $pack = $packs->get($id);
                        $price = $pack?->final_price ?? 0;
                        $title = $pack?->title ?? ('Pack #' . $id);
                        $key = 'pack-' . $id;
                        $type = 'pack';
                    } else {
                        $product = $products->get($id);
                        $price = $product?->final_price ?? 0;
                        $title = $product?->title ?? '';
                        $key = 'product-' . $id;
                        $type = 'product';
                    }

                    if (!isset($items[$key])) {
                        $items[$key] = [
                            'id' => $id,
                            'type' => $type,
                            'title' => $title,
                            'quantity' => 0,
                            'revenue' => 0,
                        ];
                    }

                    $items[$key]['quantity'] += $quantity;
                    $items[$key]['revenue'] += $price * $quantity;
                }
            }

            $topByQuantity = collect($items)->sortByDesc('quantity')->values()->take(5)->all();
            $topByRevenue = collect($items)->sortByDesc('revenue')->values()->take(5)->all();

            $availableProducts = $products->filter(fn ($p) => (bool) $p['status'])->count();
            $unavailableProducts = $products->count() - $availableProducts;
            $availablePacks = $packs->filter(fn ($p) => (bool) $p['availability'])->count();
            $unavailablePacks = $packs->count() - $availablePacks;

            return [
                'kpis' => [
                    'revenue_day' => (float) $revenueDay,
                    'revenue_week' => (float) $revenueWeek,
                    'revenue_month' => (float) $revenueMonth,
                    'orders_day' => $ordersDay,
                    'orders_week' => $ordersWeek,
                    'orders_month' => $ordersMonth,
                ],
                'status' => $statusBuckets,
                'top_quantity' => $topByQuantity,
                'top_revenue' => $topByRevenue,
                'catalog' => [
                    'products' => [
                        'available' => $availableProducts,
                        'unavailable' => $unavailableProducts,
                    ],
                    'packs' => [
                        'available' => $availablePacks,
                        'unavailable' => $unavailablePacks,
                    ],
                ],
            ];
        });

        return response()->json(['data' => $stats]);
    }
}
