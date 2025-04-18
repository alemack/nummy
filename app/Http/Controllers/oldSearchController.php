<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Services\QueryExpander;
use Illuminate\Http\Request;

class oldSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');
        $expand = $request->boolean('expand', false);

        if (!$query) {
            return response()->json(['error' => 'Missing query'], 400);
        }

        $terms = $expand
            ? (new QueryExpander())->expand($query)
            : [$query];

        // Загружаем все статьи (можно оптимизировать потом фильтрацией)
        $allArticles = Article::all();

        // Считаем релевантность для каждой статьи
        $scored = $allArticles->map(function ($article) use ($terms) {
            $score = 0;

            foreach ($terms as $term) {
                if (mb_stripos($article->title, $term) !== false) {
                    $score += 3;
                }
                if (mb_stripos($article->abstract, $term) !== false) {
                    $score += 2;
                }
                if (is_array($article->tags)) {
                    foreach ($article->tags as $tag) {
                        if (mb_stripos($tag, $term) !== false) {
                            $score += 1;
                        }
                    }
                }
            }

            $article->score = $score;
            return $article;
        });

        // Сортируем по убыванию баллов и убираем статьи с 0
        $results = $scored
            ->filter(fn($article) => $article->score > 0)
            ->sortByDesc('score')
            ->values();

        return response()->json([
            'query' => $query,
            'expanded_terms' => $terms,
            'results' => $results,
        ]);

    }
}
