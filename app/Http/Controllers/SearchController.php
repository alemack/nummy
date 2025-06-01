<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\SearchLog;
use App\Services\QueryExpander;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\ObjectId;
use MongoDB\Client as MongoClient;

class SearchController extends Controller
{
    /**
     * Handles search requests: applies query expansion and lemmatization,
     * then performs fast text search using MongoDB text index.
     */
    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        set_time_limit(60);
        $start = microtime(true);

        try {
            $query = $request->input('q');
            $expand = $request->boolean('expand', false);
            $useLemmas = $request->boolean('lemmas', true);

            if (!$query) {
                return response()->json(['error' => 'Missing query'], 400);
            }

            // --- Prepare terms for search ---
            $expandedTermsWithWeights = $expand
                ? (new QueryExpander())->expandWithWeights($query)
                : [['term' => $query, 'weight' => 1.0]];
            $rawTerms = array_column($expandedTermsWithWeights, 'term');
            $normalizedTerms = $useLemmas ? $this->lemmatizeTerms($rawTerms) : $rawTerms;

            // --- Build a single search string for MongoDB text index ---
            $searchString = implode(' ', $normalizedTerms);

            // --- Perform fast MongoDB $text search ---
            $client = new MongoClient(); // uses default URI (mongodb://localhost:27017)
            $collection = $client->scholar_db->normalized_articles;
            $pipeline = [
                ['$match' => ['$text' => ['$search' => $searchString]]],
                ['$addFields' => ['score' => ['$meta' => 'textScore']]],
                ['$sort' => ['score' => -1]],
                // ['$limit' => 100], // опционально, если нужно ограничить результаты
            ];
            $resultsCursor = $collection->aggregate($pipeline);
            $results = iterator_to_array($resultsCursor, false);

            $duration = round(microtime(true) - $start, 3);

            // --- Log search ---
            SearchLog::create([
                'query'            => $query,
                'expanded'         => $expand,
                'lemmas'           => $useLemmas,
                'expanded_terms'   => $expandedTermsWithWeights,
                'normalized_terms' => $normalizedTerms,
                'result_count'     => count($results),
                'duration'         => $duration,
            ]);

            return response()->json([
                'query'            => $query,
                'expanded_terms'   => $expandedTermsWithWeights,
                'normalized_terms' => $normalizedTerms,
                'results'          => $results,
                'duration'         => $duration,
            ]);
        } catch (\Throwable $e) {
            Log::error("SearchController ERROR: " . $e->getMessage());
            return response()->json([
                'error' => 'Internal Server Error',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Лемматизация массива terms через внешний Python-скрипт.
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
                Log::warning("Lemmatization: empty output. Command: $command");
                return [];
            }

            $decoded = json_decode(trim($output), true);
            if (!is_array($decoded)) {
                Log::error("Lemmatization: invalid JSON. Output: " . $output);
                return [];
            }

            return $decoded;
        } catch (\Throwable $e) {
            Log::error("Lemmatization error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Возвращает статью по id из коллекции articles.
     */
    public function getArticle($id)
    {
        $article = Article::where('_id', new ObjectId($id))->first();
        if (!$article) {
            return response()->json(['error' => 'Not found'], 404);
        }
        return response()->json($article);
    }
}
