<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
    public function upload(array $images, string $directory = 'products'): array
    {
        $storedImages = [];

        // Prevent nested "public/public" folders if caller passes "public/..." or leading slashes.
        $cleanDirectory = trim($directory, '/');
        if (Str::startsWith($cleanDirectory, 'public/')) {
            $cleanDirectory = Str::after($cleanDirectory, 'public/');
        }

        foreach ($images as $image) {
            if (!$image instanceof UploadedFile) {
                continue;
            }

            $filename = Str::uuid()->toString() . '.' . $image->getClientOriginalExtension();

            // store on the public disk without duplicating "public/" in the path
            $path = $image->storeAs($cleanDirectory, $filename, 'public');
            $url = Storage::url($path); // may include APP_URL depending on config

            $appUrl = config('app.url');
            if (!empty($appUrl) && Str::startsWith($url, $appUrl)) {
                $url = Str::replaceFirst($appUrl, '', $url);
            }

            // ensure we store a relative path like /storage/...
            $storedImages[] = Str::start($url, '/');
        }

        return $storedImages;
    }
}
