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
            $batch[] = [
                'title' => $entry['title'] ?? 'Без названия',
                'abstract' => $entry['abstract'] ?? '',
                'tags' => $entry['tags'] ?? [],
                'author' => $entry['author'] ?? 'Unknown',
                'date' => $entry['date'] ?? now(),
            ];
        }

        // Для больших объёмов — вставка по чанкам (например, по 1000 записей)
        $chunks = array_chunk($batch, 1000);

        foreach ($chunks as $i => $chunk) {
            Article::insert($chunk);
            echo "Импортировано записей: " . count($chunk) . " (чанк #" . ($i + 1) . ")\n";
        }

        echo "Импорт завершён успешно. Всего импортировано статей: " . count($data) . "\n";
    }
}
