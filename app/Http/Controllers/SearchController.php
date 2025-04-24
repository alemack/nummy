<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\NormalizedArticle;
use App\Services\QueryExpander;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\ObjectId;
use Illuminate\Support\Collection;

class SearchController extends Controller
{
    /**
     * Handles the search functionality by processing the user query, expanding it if necessary,
     * and finding relevant results from the database, generating a score for relevance.
     *
     * The search process includes the following steps:
     * - Reading the query and additional flags (`expand` and `lemmas`) from the request.
     * - Logging the initial user query for tracking purposes.
     * - Expanding the query terms if expansion is enabled, and further normalizing terms using lemmatization if enabled.
     * - Scoring documents based on their relevance to the search query, using titles, abstracts, and tags.
     * - Returning the results sorted by score, along with metadata like duration and expanded/normalized query terms.
     *
     * In case of errors, logs relevant error messages and returns an error response with appropriate details.
     *
     * @param Request $request The HTTP request containing the query and flags for expansion and lemmatization.
     *
     * @return \Illuminate\Http\JsonResponse The search results, including matching documents, their formatted scores,
     *                                       normalized query terms, and other metadata, or an error response if applicable.
     */
    public function search(Request $request)
    {
        set_time_limit(120); // увеличивает лимит до 120 секунд
        $start = microtime(true); // старт таймера
        try {
            $query = $request->input('q');
            $expand = $request->boolean('expand', false);
            $useLemmas = $request->boolean('lemmas', true);

            if (!$query) {
                return response()->json(['error' => 'Missing query'], 400);
            }

            Log::info("Запрос поиска: {$query} | expand: {$expand}, lemmas: {$useLemmas}");

            $expandedTermsWithWeights = $expand
                ? (new QueryExpander())->expandWithWeights($query)
                : [['term' => $query, 'weight' => 1.0]];

            $rawTerms = array_column($expandedTermsWithWeights, 'term');

            $normalizedTerms = $useLemmas
                ? $this->lemmatizeTerms($rawTerms)
                : $rawTerms;

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

            $scored = collect();

            foreach (NormalizedArticle::cursor() as $doc) {
                $score = 0;

                foreach ($termsWithWeights as $tw) {
                    $term = $tw['term'];
                    $weight = $tw['weight'];

                    if (mb_stripos($doc->title, $term) !== false) {
                        $score += 3 * $weight;
                    }
                    if (mb_stripos($doc->abstract, $term) !== false) {
                        $score += 2 * $weight;
                    }
                    if (is_array($doc->tags)) {
                        foreach ($doc->tags as $tag) {
                            if (mb_stripos($tag, $term) !== false) {
                                $score += 1 * $weight;
                            }
                        }
                    }
                }

                if ($score > 0) {
                    $scored->push([
                        'id' => $doc->_id,
                        'score' => round($score, 4),
                    ]);
                }
            }

            $scored = $scored->sortByDesc('score')->values();

            if ($scored->isEmpty()) {
                Log::info("Ничего не найдено по запросу: '{$query}'");
                return response()->json([
                    'query' => $query,
                    'expanded_terms' => $expandedTermsWithWeights,
                    'normalized_terms' => $normalizedTerms,
                    'results' => [],
                    'message' => 'По вашему запросу ничего не найдено.',
                ]);
            }

            $ids = $scored->pluck('id')->map(fn($id) => new ObjectId($id))->toArray();
            $articles = Article::whereIn('_id', $ids)->get();

            $results = $articles->map(function ($article) use ($scored) {
                $entry = $scored->firstWhere('id', $article->_id);
                $article->score = $entry['score'] ?? 0;
                return $article;
            })->sortByDesc('score')->values();

            $duration = round(microtime(true) - $start, 3); // в секундах

            return response()->json([
                'query' => $query,
                'expanded_terms' => $expandedTermsWithWeights,
                'normalized_terms' => $normalizedTerms,
                'results' => $results,
                'duration' => $duration,
            ]);
        } catch (\Throwable $e) {
            Log::error("Ошибка в SearchController: " . $e->getMessage());
            return response()->json([
                'error' => 'Internal Server Error',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Processes the provided terms by lemmatizing them using an external Python script.
     *
     * This function constructs a command to invoke a Python script that performs
     * lemmatization on the input terms. It handles the script’s execution, parses
     * the output, and logs any issues encountered during the process.
     *
     * @param array $terms An array of terms to be lemmatized.
     *
     * @return array The lemmatized terms as an array. Returns an empty array if an
     *               error occurs or the output is invalid.
     *
     * @throws \Throwable Logs any errors or exceptions that occur during script
     *                    execution or result handling.
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
            Log::error("Ошибка при лемматизации: " . $e->getMessage());
            return [];
        }
    }
}
