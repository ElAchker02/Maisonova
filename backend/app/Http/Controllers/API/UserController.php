<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 20), 100);
        $users = User::orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'min:8'],
            'role' => ['required', Rule::in(['admin', 'superadmin'])],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'],
        ]);

        return response()->json([
            'message' => 'Utilisateur créé',
            'data' => $user,
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'nullable', 'confirmed', 'min:8'],
            'role' => ['sometimes', Rule::in(['admin', 'superadmin'])],
        ]);

        if (
            $user->role === 'superadmin' &&
            isset($data['role']) &&
            $data['role'] !== 'superadmin' &&
            User::where('role', 'superadmin')->count() <= 1
        ) {
            return response()->json([
                'message' => 'Au moins un superadmin doit rester.',
            ], 422);
        }

        $payload = array_filter([
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'role' => $data['role'] ?? null,
        ], fn ($value) => $value !== null);

        if (!empty($data['password'])) {
            $payload['password'] = $data['password'];
        }

        $user->update($payload);

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'data' => $user->fresh(),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->role === 'superadmin' && User::where('role', 'superadmin')->count() <= 1) {
            return response()->json([
                'message' => 'Impossible de supprimer le dernier superadmin.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé',
        ]);
    }
}
