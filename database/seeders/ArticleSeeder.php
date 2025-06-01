<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        // Очистка коллекции перед импортом
        Article::query()->delete();

        $path = storage_path('app/arxiv_dataset.json');

        if (!File::exists($path)) {
            echo "Файл arxiv_dataset.json не найден по пути: $path\n";
            return;
        }

        $json = File::get($path);
        $data = json_decode($json, true);

        if (!is_array($data) || empty($data)) {
            echo "Не удалось прочитать или декодировать JSON.\n";
            return;
        }

        $batch = [];

        foreach ($data as $entry) {
            // Удаляем id и _id из входных данных, чтобы не было конфликтов с MongoDB
            unset($entry['id'], $entry['_id']);

            $batch[] = [
                'title'            => $entry['title'] ?? 'Без названия',
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
                'lang'             => $entry['lang'] ?? 'en'
            ];
        }

        // Для больших объёмов — вставка по чанкам (например, по 1000 записей)
        $chunks = array_chunk($batch, 1000);

        $total = 0;
        foreach ($chunks as $i => $chunk) {
            Article::insert($chunk);
            $total += count($chunk);
            echo "Импортировано записей: " . count($chunk) . " (чанк #" . ($i + 1) . ")\n";
        }

        echo "Импорт завершён успешно. Всего импортировано статей: " . $total . "\n";
    }
}
