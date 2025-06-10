<?php

namespace App\Http\Controllers;

use App\Models\SearchLog;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Возвращает сводную статистику для Dashboard:
     * - общее число запросов
     * - среднее число найденных результатов
     * - среднее время поиска
     * - процент «успешных» запросов
     * - топ-5 запросов по частоте
     */
    public function stats(): JsonResponse
    {
        // Берём все логи
        $logs = SearchLog::all();

        $total = $logs->count();
        $avgResults   = $total ? round($logs->avg('result_count'), 2) : 0;
        $avgTime      = $total ? round($logs->avg('duration'), 3) : 0;
        $successCount = $logs->where('result_count', '>', 0)->count();
        $successRate  = $total ? round($successCount / $total * 100, 1) : 0;

        // Считаем частоту каждого уникального запроса
        $freq = [];
        foreach ($logs as $log) {
            $q = mb_strtolower(trim($log->query));
            $freq[$q] = ($freq[$q] ?? 0) + 1;
        }
        // Сортируем и берём топ-5
        arsort($freq);
        $top5 = array_slice($freq, 0, 5, true);
        $topQueries = [];
        foreach ($top5 as $query => $count) {
            $topQueries[] = ['query' => $query, 'count' => $count];
        }

        return response()->json([
            'totalQueries'   => $total,
            'avgResults'     => $avgResults,
            'avgTime'        => $avgTime,
            'successRatePct' => $successRate,
            'topQueries'     => $topQueries,
        ]);
    }
}
