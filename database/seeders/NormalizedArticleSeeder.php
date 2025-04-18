<?php

namespace Database\Seeders;

use App\Models\NormalizedArticle;
use Illuminate\Database\Seeder;
use MongoDB\BSON\ObjectId;

class NormalizedArticleSeeder extends Seeder
{
    public function run(): void
    {
        NormalizedArticle::query()->delete();

        $path = storage_path('app/normalized_articles.json');

        if (!file_exists($path)) {
            echo "Файл normalized_articles.json не найден по пути: $path\n";
            return;
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        if (!$data || !is_array($data)) {
            echo "Не удалось прочитать или декодировать JSON.\n";
            return;
        }

        foreach ($data as $entry) {
            if (!isset($entry['_id']['$oid'])) {
                echo "Пропущена запись без _id\n";
                continue;
            }

            NormalizedArticle::create([
                '_id' => new ObjectId($entry['_id']['$oid']),
                'title' => $entry['title'] ?? '',
                'abstract' => $entry['abstract'] ?? '',
                'tags' => $entry['tags'] ?? [],
                'author' => $entry['author'] ?? 'Unknown',
                'date' => $entry['date'] ?? now(),
            ]);
        }

        echo "Импорт нормализованных статей завершён: " . count($data) . "\n";
    }
}
