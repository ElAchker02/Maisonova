<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\PackController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\SettingsController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login']);

Route::get('settings', [SettingsController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::middleware('superadmin')->group(function () {
        Route::post('auth/register', [AuthController::class, 'register']);
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
        Route::post('settings', [SettingsController::class, 'update']);
    });
});

Route::get('products/{id}/related', [ProductController::class, 'related']);
Route::get('products/top-sales', [ProductController::class, 'topSales']);
Route::get('categories', [ProductController::class, 'categories']);

Route::apiResource('products', ProductController::class);
Route::apiResource('packs', PackController::class);
Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
Route::put('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');

Route::post('packs/{pack}/products', [PackController::class, 'addProductToPack'])->middleware('auth:sanctum');
Route::delete('packs/{pack}/products/{product}', [PackController::class, 'removeProductFromPack'])->middleware('auth:sanctum');
