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

        foreach ($images as $image) {
            if (!$image instanceof UploadedFile) {
                continue;
            }

            $filename = Str::uuid()->toString() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs("public/{$directory}", $filename);
            $storedImages[] = Storage::url($path);
        }

        return $storedImages;
    }
}
