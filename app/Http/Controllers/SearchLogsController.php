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
}
