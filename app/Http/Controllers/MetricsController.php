<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class MetricsController extends Controller
{
    /**
     * Запускает Python-скрипт оценки качества поиска и возвращает результат в формате JSON.
     * Перезапускается автоматически, если файл устарел (24ч) или передан force=1.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function runEvaluation(Request $request): JsonResponse
    {
        $scriptPath  = base_path('scripts/python/evaluate_search/evaluate_search.py');
        $pythonExe   = base_path('scripts/python/venv/Scripts/python.exe');
        $outputFile  = base_path('scripts/python/evaluate_search/evaluation_results.json');

        // TTL кеша в секундах (24 часа)
        $ttl = 24 * 3600;
        $force = $request->boolean('force', false);

        // Решаем, нужно ли запускать
        $needsRun = $force
            || !file_exists($outputFile)
            || (filemtime($outputFile) < time() - $ttl);

        if ($needsRun) {
            Log::info("[MetricsController] Запуск оценки поиска (force={$force})...");
            $cmd = escapeshellarg($pythonExe)
                . ' '
                . escapeshellarg($scriptPath);
            exec($cmd . ' 2>&1', $out, $code);
            if ($code !== 0) {
                Log::error("[MetricsController] Ошибка запуска скрипта (код $code). Вывод:\n" . implode("\n", $out));
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Не удалось запустить скрипт оценки поиска.',
                    'details' => $out,
                ], 500);
            }
            Log::info("[MetricsController] Скрипт завершился успешно, файл с метриками обновлён.");
        } else {
            Log::info("[MetricsController] Используем кешированные метрики из {$outputFile}.");
        }

        if (!file_exists($outputFile)) {
            Log::error("[MetricsController] Файл метрик не найден после запуска скрипта.");
            return response()->json([
                'status'  => 'error',
                'message' => 'Файл с результатами оценки не найден.',
            ], 500);
        }

        $json = @file_get_contents($outputFile);
        $data = json_decode($json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error("[MetricsController] Некорректный JSON в метриках: " . json_last_error_msg());
            return response()->json([
                'status'  => 'error',
                'message' => 'Ошибка разбора JSON-результатов.',
            ], 500);
        }

        Log::info("[MetricsController] Метрики загружены и возвращаются клиенту.");
        return response()->json([
            'status'  => 'success',
            'metrics' => $data,   // ожидаем массив { query, ground_truth_count, field_sets }
        ]);
    }
}
