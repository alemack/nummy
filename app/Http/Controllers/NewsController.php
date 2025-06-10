<?php
// app/Http/Controllers/NewsController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\NewsApiService;

class NewsController extends Controller
{
    protected NewsApiService $news;

    public function __construct(NewsApiService $news)
    {
        $this->news = $news;
    }

    /**
     * GET /api/news?query=...
     */
    public function search(Request $request): JsonResponse
    {
        $q     = $request->query('query', 'non-relational databases');
        $limit = min(100, (int)$request->query('limit', 5));

        $articles = $this->news->search($q, $limit);

        return response()->json([
            'status'   => 'success',
            'query'    => $q,
            'limit'    => $limit,
            'articles' => $articles,
        ]);
    }
}
