<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Models\Article;
use Illuminate\Support\Facades\File;

class DataLoaderController extends Controller
{
    public function run(): \Illuminate\Http\JsonResponse
    {
        set_time_limit(0); // <-- ждём сколько надо (0 = безлимит)

        $python = 'D:\\projects\\nummy\\scripts\\python\\venv\\Scripts\\python.exe';
        $script = 'D:\\projects\\nummy\\scripts\\python\\fetch_arxiv.py';
        $command = "\"{$python}\" \"{$script}\"";

        $output = [];
        $returnVar = 0;

        try {
            exec($command . ' 2>&1', $output, $returnVar);

            if ($returnVar !== 0) {
                Log::error('Ошибка запуска fetch_arxiv.py: ' . implode("\n", $output));
                return response()->json([
                    'success' => false,
                    'error' => 'Script returned non-zero exit code',
                ], 500);
            }

            return response()->json([
                'success' => true,
            ]);
        } catch (\Throwable $e) {
            Log::error('Exception in DataLoaderController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function importArticles(): \Illuminate\Http\JsonResponse
    {
        $path = storage_path('app/arxiv_dataset.json');

        if (!File::exists($path)) {
            return response()->json([
                'success' => false,
                'error' => "Файл arxiv_dataset.json не найден по пути: $path"
            ], 404);
        }

        $json = File::get($path);
        $data = json_decode($json, true);

        if (!is_array($data) || empty($data)) {
            return response()->json([
                'success' => false,
                'error' => "Не удалось прочитать или декодировать JSON"
            ], 500);
        }

        // Очищаем коллекцию
        Article::query()->delete();

        $batch = [];
        foreach ($data as $entry) {
            $batch[] = [
                'title'            => $entry['title'] ?? 'Без названия',
                'abstract'         => $entry['abstract'] ?? '',
                'tags'             => $entry['tags'] ?? [],
                'authors'          => $entry['authors'] ?? [],
                'affiliations'     => $entry['affiliations'] ?? [],
                'date'             => $entry['date'] ?? now(),
                'updated'          => $entry['updated'] ?? null,
                'arxiv_id'         => $entry['arxiv_id'] ?? null,
                'primary_category' => $entry['primary_category'] ?? null,
                'categories'       => $entry['categories'] ?? [],
                'doi'              => $entry['doi'] ?? null,
                'pdf_url'          => $entry['pdf_url'] ?? null,
                'comment'          => $entry['comment'] ?? null,
                'journal_ref'      => $entry['journal_ref'] ?? null,
                'lang'             => $entry['lang'] ?? null,
            ];
        }

        // По чанкам, если данных много
        $chunks = array_chunk($batch, 1000);
        $total = 0;
        foreach ($chunks as $chunk) {
            Article::insert($chunk);
            $total += count($chunk);
        }

        return response()->json([
            'success' => true,
            'imported' => $total
        ]);
    }

    public function exportAndNormalize(): \Illuminate\Http\JsonResponse
    {
        $exportPath = storage_path('app/articles_export.json');
        $normalizeScript = 'D:\\projects\\nummy\\scripts\\python\\build_normalized_articles.py';
        $python = 'D:\\projects\\nummy\\scripts\\python\\venv\\Scripts\\python.exe';
        $outputFile = storage_path('app/normalized_articles.json');

        try {
            // 1. Экспорт статей из MongoDB
            $all = \App\Models\Article::all()->toArray();
            file_put_contents($exportPath, json_encode($all, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

            // 2. Запуск Python-скрипта для нормализации
            // Передаём абсолютные пути, чтобы не было путаницы
            $command = "\"{$python}\" \"{$normalizeScript}\" \"{$exportPath}\" \"{$outputFile}\"";
            $output = [];
            $returnVar = 0;
            exec($command . ' 2>&1', $output, $returnVar);

            if ($returnVar !== 0) {
                Log::error("Ошибка в build_normalized_articles.py:\n" . implode("\n", $output));
                return response()->json([
                    'success' => false,
                    'error' => 'Ошибка запуска build_normalized_articles.py',
                    'logs' => $output,
                ], 500);
            }

            // 3. Проверяем, что файл успешно создан
            if (!file_exists($outputFile)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Файл normalized_articles.json не был создан',
                    'logs' => $output,
                ], 500);
            }

            return response()->json([
                'success' => true,
                'exported' => count($all),
//                'normalized_file' => $outputFile,
            ]);

        } catch (\Throwable $e) {
            Log::error('Ошибка exportAndNormalize: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function importNormalizedArticles(): \Illuminate\Http\JsonResponse
    {
        $path = storage_path('app/normalized_articles.json');

        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'error' => "Файл normalized_articles.json не найден по пути: $path"
            ], 404);
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        if (!is_array($data) || empty($data)) {
            return response()->json([
                'success' => false,
                'error' => "Не удалось прочитать или декодировать JSON"
            ], 500);
        }

        \App\Models\NormalizedArticle::truncate();

        $batch = [];
        $skipped = 0;
        foreach ($data as $entry) {
            // Используем _id или id, но не оба!
            $id = $entry['_id'] ?? $entry['id'] ?? null;

            if (!$id || strlen($id) !== 24 || !ctype_xdigit($id)) {
                $skipped++;
                continue;
            }

            // Готовим запись — оставляем только _id, удаляем id
            $item = [
                '_id'              => new \MongoDB\BSON\ObjectId($id),
                'title'            => $entry['title'] ?? '',
                'abstract'         => $entry['abstract'] ?? '',
                'tags'             => isset($entry['tags']) && is_array($entry['tags']) ? $entry['tags'] : [],
                'authors'          => isset($entry['authors']) && is_array($entry['authors']) ? $entry['authors'] : [],
                'affiliations'     => isset($entry['affiliations']) && is_array($entry['affiliations']) ? $entry['affiliations'] : [],
                'date'             => $entry['date'] ?? now(),
                'updated'          => $entry['updated'] ?? null,
                'arxiv_id'         => $entry['arxiv_id'] ?? null,
                'primary_category' => $entry['primary_category'] ?? null,
                'categories'       => isset($entry['categories']) && is_array($entry['categories']) ? $entry['categories'] : [],
                'doi'              => $entry['doi'] ?? null,
                'pdf_url'          => $entry['pdf_url'] ?? null,
                'comment'          => $entry['comment'] ?? null,
                'journal_ref'      => $entry['journal_ref'] ?? null,
                'lang'             => $entry['lang'] ?? null,
            ];
            // Здесь НЕ добавляем 'id'
            $batch[] = $item;
        }

        $chunks = array_chunk($batch, 1000);
        $total = 0;
        foreach ($chunks as $chunk) {
            \App\Models\NormalizedArticle::insert($chunk);
            $total += count($chunk);
        }
        return response()->json([
            'success' => true,
            'imported' => $total,
            'skipped' => $skipped,
        ]);
    }

    public function buildSynonyms(): \Illuminate\Http\JsonResponse
    {
        $normalizedPath = storage_path('app/normalized_articles.json');
        $python = 'D:\\projects\\nummy\\scripts\\python\\venv\\Scripts\\python.exe';
        $script = 'D:\\projects\\nummy\\scripts\\python\\build_synonyms.py';
        $outputFile = storage_path('app/query_synonyms.json');

        if (!file_exists($normalizedPath)) {
            return response()->json([
                'success' => false,
                'error' => "Файл normalized_articles.json не найден по пути: $normalizedPath"
            ], 404);
        }

        // Запуск build_synonyms.py с абсолютным путём к файлам
        $command = "\"{$python}\" \"{$script}\" \"{$normalizedPath}\" \"{$outputFile}\"";
        $output = [];
        $returnVar = 0;
        exec($command . ' 2>&1', $output, $returnVar);

        if ($returnVar !== 0) {
            Log::error("Ошибка в build_synonyms.py:\n" . implode("\n", $output));
            return response()->json([
                'success' => false,
                'error' => 'Ошибка запуска build_synonyms.py',
                'logs' => $output,
            ], 500);
        }

        // Проверяем, что файл был создан
        if (!file_exists($outputFile)) {
            return response()->json([
                'success' => false,
                'error' => 'Файл query_synonyms.json не был создан',
                'logs' => $output,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Словарь синонимов успешно сгенерирован',
            'output_file' => $outputFile,
        ]);
    }
}
