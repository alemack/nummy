<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\NormalizedArticle;
use App\Services\QueryExpander;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\ObjectId;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');
        $expand = $request->boolean('expand', false);
        $useLemmas = $request->boolean('lemmas', true);

        if (!$query) {
            return response()->json(['error' => 'Missing query'], 400);
        }

        // Расширение с весами: [['term' => '...', 'weight' => 1.0], ...]
        $expandedTermsWithWeights = $expand
            ? (new QueryExpander())->expandWithWeights($query)
            : [['term' => $query, 'weight' => 1.0]];

        // Извлекаем сами термины для лемматизации
        $rawTerms = array_column($expandedTermsWithWeights, 'term');

        // Лемматизируем, если нужно
        $normalizedTerms = $useLemmas
            ? $this->lemmatizeTerms($rawTerms)
            : $rawTerms;

        // Связываем нормализованные термины с весами
        $termsWithWeights = [];
        foreach ($expandedTermsWithWeights as $i => $item) {
            $term = $normalizedTerms[$i] ?? null;
            if ($term) {
                $termsWithWeights[] = [
                    'term' => $term,
                    'weight' => floatval($item['weight'])
                ];
            }
        }

        // Получаем нормализованные статьи
        $allNormalized = NormalizedArticle::all();

        // Подсчёт релевантности с учётом весов
        $scored = $allNormalized->map(function ($normalized) use ($termsWithWeights) {
            $score = 0;

            foreach ($termsWithWeights as $tw) {
                $term = $tw['term'];
                $weight = $tw['weight'];

                if (mb_stripos($normalized->title, $term) !== false) {
                    $score += 3 * $weight;
                }
                if (mb_stripos($normalized->abstract, $term) !== false) {
                    $score += 2 * $weight;
                }
                if (is_array($normalized->tags)) {
                    foreach ($normalized->tags as $tag) {
                        if (mb_stripos($tag, $term) !== false) {
                            $score += 1 * $weight;
                        }
                    }
                }
            }

            return [
                'id' => $normalized->_id,
                'score' => round($score, 4),
            ];
        })
            ->filter(fn($item) => $item['score'] > 0)
            ->sortByDesc('score')
            ->values();

        // Если ничего не найдено
        if ($scored->isEmpty()) {
            Log::info("Нет релевантных нормализованных статей по запросу: '{$query}'");
            return response()->json([
                'query' => $query,
//                'expanded_terms' => array_column($expandedTermsWithWeights, 'term'),
                'expanded_terms' => $expandedTermsWithWeights,
                'normalized_terms' => $normalizedTerms,
                'results' => [],
                'message' => 'По вашему запросу ничего не найдено.',
            ]);
        }

        // Получаем оригинальные статьи по ID
        $ids = $scored->pluck('id')->map(fn($id) => new ObjectId($id))->toArray();
        $articles = Article::whereIn('_id', $ids)->get();

        // Присваиваем score
        $results = $articles->map(function ($article) use ($scored) {
            $scoreEntry = $scored->firstWhere('id', $article->_id);
            $article->score = $scoreEntry['score'] ?? 0;
            return $article;
        })->sortByDesc('score')->values();

        return response()->json([
            'query' => $query,
//            'expanded_terms' => array_column($expandedTermsWithWeights, 'term'),
            'expanded_terms' => $expandedTermsWithWeights,
            'normalized_terms' => $normalizedTerms,
            'results' => $results,
        ]);
    }

    /**
     * Лемматизация массива терминов через внешний Python-скрипт
     */
    private function lemmatizeTerms(array $terms): array
    {
        try {
            $scriptPath = base_path('scripts/python/normalize_query.py');
            $query = implode(' ', $terms);
            $python = 'D:\\projects\\nummy\\scripts\\python\\venv\\Scripts\\python.exe';
            $command = $python . ' ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($query);

            $output = shell_exec($command);

            if (!$output) {
                Log::warning("Лемматизация: пустой вывод от скрипта. Команда: $command");
                return [];
            }

            $decoded = json_decode(trim($output), true);

            if (!is_array($decoded)) {
                Log::error("Лемматизация: неверный JSON. Вывод: " . $output);
                return [];
            }

            return $decoded;
        } catch (\Throwable $e) {
            Log::error("Ошибка при лемматизации запроса: " . $e->getMessage());
            return [];
        }
    }
}
