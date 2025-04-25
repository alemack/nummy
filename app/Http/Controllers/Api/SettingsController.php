<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserSetting;

class SettingsController extends Controller
{
    public function show(Request $request)
    {
        $userId = $request->user()->getAuthIdentifier();

        $settings = UserSetting::firstOrCreate(
            ['user_id' => $userId],
            [
                'dark_mode'         => false,
                'highlight_matches' => false,
                'language'          => 'ru',
            ]
        );

        return response()->json(['settings' => $settings]);
    }

    public function update(Request $request)
    {
        $userId = $request->user()->getAuthIdentifier();

        $data = $request->validate([
            'darkMode'         => 'sometimes|boolean',
            'highlightMatches' => 'sometimes|boolean',
            'language'         => 'sometimes|in:ru,en',
        ]);

        $settings = UserSetting::updateOrCreate(
            ['user_id' => $userId],
            [
                'dark_mode'         => $data['darkMode'] ?? false,
                'highlight_matches' => $data['highlightMatches'] ?? false,
                'language'          => $data['language'] ?? 'ru',
            ]
        );

        return response()->json(['settings' => $settings]);
    }
}
