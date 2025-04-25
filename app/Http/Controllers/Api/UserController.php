<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(Request $request)
    {
        // Возвращаем текущего авторизованного
        return response()->json([
            'user' => $request->user()
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        $user = $request->user();
        $user->fill($data);
        $user->save();

        return response()->json([
            'user' => $user
        ]);
    }
}
