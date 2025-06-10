<?php

namespace App\Http\Controllers;

use App\Models\SearchLog;
use Illuminate\Http\Request;

class SearchLogsController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->query('limit', 100);
        $logs = SearchLog::orderBy('_id', 'desc')
            ->take($limit)
            ->get([
                'query','expanded','lemmas',
                'expanded_terms','normalized_terms',
                'result_count','duration','created_at'
            ]);

        return response()->json([
            'status' => 'success',
            'logs'   => $logs,
        ]);
    }
    public function summary()
    {
        $logs = \App\Models\SearchLog::all();

        $total      = $logs->count();
        $avgResults = round($logs->avg('result_count'), 2);
        $avgTime    = round($logs->avg('duration'), 3);

        // Метрики по режимам (Basic / Synonyms / Syn+Lemma)
        $modes = [
            'Basic'      => $logs->where('expanded', false)->where('lemmas', false),
            'Synonyms'   => $logs->where('expanded', true)->where('lemmas', false),
            'Syn+Lemma'  => $logs->where('expanded', true)->where('lemmas', true),
        ];
        $modeStats = [];
        foreach ($modes as $label => $items) {
            $modeStats[$label] = [
                'count'      => $items->count(),
                'avgResults' => $items->count() ? round($items->avg('result_count'), 2) : 0,
                'avgTime'    => $items->count() ? round($items->avg('duration'), 3) : 0,
            ];
        }

        return response()->json([
            'total'      => $total,
            'avgResults' => $avgResults,
            'avgTime'    => $avgTime,
            'modes'      => $modeStats,
        ]);
    }

    public function summaryPerQuery()
    {
        $logs = \App\Models\SearchLog::orderBy('_id', 'desc')->take(100)->get();

        // Сгруппировать по уникальному query (без учёта регистра и пробелов)
        $grouped = [];
        foreach ($logs as $log) {
            $q = trim(mb_strtolower($log->query));
            if (!isset($grouped[$q])) {
                $grouped[$q] = [];
            }
            $grouped[$q][] = $log;
        }
        // Взять только последние 10 уникальных запросов
        $queries = array_slice(array_keys($grouped), 0, 10);

        $result = [];
        foreach ($queries as $q) {
            $byMode = [];
            foreach ($grouped[$q] as $log) {
                $mode = $log->expanded && $log->lemmas ? 'Syn+Lemma'
                    : ($log->expanded ? 'Synonyms'
                        : ($log->lemmas ? 'Basic' : 'Basic'));
                if (!isset($byMode[$mode])) $byMode[$mode] = [];
                $byMode[$mode][] = $log;
            }
            $modesSummary = [];
            foreach ($byMode as $mode => $logsMode) {
                $resultsArr = array_map(fn($l) => $l->result_count, $logsMode);
                $timesArr   = array_map(fn($l) => $l->duration, $logsMode);
                $modesSummary[$mode] = [
                    'count'      => count($logsMode),
                    'avgResults' => count($resultsArr) ? round(array_sum($resultsArr) / count($resultsArr), 2) : 0,
                    'medResults' => self::median($resultsArr),
                    'avgTime'    => count($timesArr) ? round(array_sum($timesArr) / count($timesArr), 3) : 0,
                    'medTime'    => self::median($timesArr),
                ];
            }
            $result[] = [
                'query' => $q,
                'modes' => $modesSummary
            ];
        }
        return response()->json([
            'status'  => 'success',
            'queries' => $result
        ]);
    }

    protected static function median($arr)
    {
        if (!$arr) return 0;
        sort($arr);
        $n = count($arr);
        $h = (int) floor(($n-1)/2);
        return ($n % 2) ? $arr[$h] : ($arr[$h] + $arr[$h+1]) / 2;
    }


}
