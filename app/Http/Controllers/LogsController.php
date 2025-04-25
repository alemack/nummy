<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class LogsController extends Controller
{
    /**
     * Читает последние N строк из файла логов и возвращает их в виде JSON.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $path = storage_path('logs/laravel.log');

        if (!File::exists($path)) {
            Log::error("[LogsController] Файл логов не найден по пути: {$path}");
            return response()->json([
                'status'  => 'error',
                'message' => 'Лог-файл не найден.'
            ], 404);
        }

        // Сколько последних строк вернуть (по умолчанию 100)
        $linesToFetch = (int) $request->query('limit', 100);

        // Читаем весь файл (можно оптимизировать tail’ом)
        $all   = File::lines($path);
        $total = iterator_count($all);
        // снова пересоздаём итератор
        $all   = File::lines($path);

        $start = max(0, $total - $linesToFetch);
        $logs  = [];

        foreach ($all as $i => $line) {
            if ($i < $start) continue;
            // Парсим строку вида:
            // [2025-04-25 12:34:56] local.ERROR: Something went wrong {"exception":"…"}
            if (preg_match('/^\[([^\]]+)\]\s+(\w+)\.(\w+):\s+(.*?)\s*(\{.*\})?$/', $line, $m)) {
                $logs[] = [
                    'timestamp' => $m[1],
                    'level'     => strtolower($m[3]),  // ERROR, WARNING, INFO
                    'channel'   => strtolower($m[2]),
                    'message'   => $m[4],
                    'details'   => isset($m[5]) ? $m[5] : null,
                ];
            } else {
                // если не подошло под шаблон — как есть
                $logs[] = [
                    'timestamp' => null,
                    'level'     => 'info',
                    'channel'   => 'log',
                    'message'   => trim($line),
                    'details'   => null,
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'logs'   => $logs,
        ]);
    }
}
