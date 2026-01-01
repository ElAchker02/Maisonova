<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class SettingsController extends Controller
{
    public function __construct(private ImageUploadService $uploader)
    {
    }

    public function show(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'data' => [
                'theme' => $settings['theme'] ?? null,
                'contact' => $settings['contact'] ?? null,
                'social' => $settings['social'] ?? null,
                'carousel' => $settings['carousel'] ?? [],
                'logo' => $settings['logo']['url'] ?? null,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'theme.primary' => ['required', 'string', 'max:20'],
            'theme.secondary' => ['required', 'string', 'max:20'],
            'theme.background' => ['required', 'string', 'max:20'],
            'theme.text' => ['required', 'string', 'max:20'],

            'contact.phone' => ['required', 'string', 'max:100'],
            'contact.email' => ['required', 'email', 'max:150'],
            'contact.address' => ['required', 'string', 'max:255'],

            'social.facebook' => ['nullable', 'url', 'max:255'],
            'social.instagram' => ['nullable', 'url', 'max:255'],

            'keep_carousel' => ['nullable', 'array'],
            'keep_carousel.*' => ['string'],
            'carousel' => ['nullable', 'array'],
            'carousel.*' => ['image', 'max:4096'],

            'logo' => ['nullable', 'image', 'max:4096'],
            'keep_logo' => ['nullable', 'boolean'],
        ]);

        // Theme / contact / social
        $this->set('theme', $validated['theme']);
        $this->set('contact', $validated['contact']);
        $this->set('social', Arr::only($validated['social'] ?? [], ['facebook', 'instagram']));

        // Logo
        $logoSetting = Setting::where('key', 'logo')->first();
        $logoUrl = $logoSetting?->value['url'] ?? null;
        if (($validated['keep_logo'] ?? false) === false) {
            $logoUrl = null;
        }
        if ($request->hasFile('logo')) {
            $uploaded = $this->uploader->upload([$request->file('logo')], 'branding');
            $logoUrl = $uploaded[0] ?? $logoUrl;
        }
        $this->set('logo', ['url' => $logoUrl]);

        // Carousel images
        $existingCarousel = Setting::where('key', 'carousel')->first()?->value ?? [];
        $keepCarousel = $validated['keep_carousel'] ?? [];
        $kept = array_values(array_filter($existingCarousel, fn ($url) => in_array($url, $keepCarousel, true)));
        $uploadedCarousel = $request->hasFile('carousel') ? $this->uploader->upload($request->file('carousel'), 'carousel') : [];
        $finalCarousel = array_values(array_unique(array_merge($kept, $uploadedCarousel)));
        $this->set('carousel', $finalCarousel);

        return response()->json([
            'message' => 'Paramètres mis à jour',
            'data' => [
                'theme' => $validated['theme'],
                'contact' => $validated['contact'],
                'social' => Arr::only($validated['social'] ?? [], ['facebook', 'instagram']),
                'logo' => $logoUrl,
                'carousel' => $finalCarousel,
            ],
        ]);
    }

    private function set(string $key, mixed $value): void
    {
        Setting::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
