<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function ping(Request $request)
    {
        $param = $request->query('msg', 'привет');
        logger()->debug('🔥 Тестовый запрос: ' . $param);

        return response()->json([
            'status' => 'ok',
            'message' => $param,
        ]);
    }
}
