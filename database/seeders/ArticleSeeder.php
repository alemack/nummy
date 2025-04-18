<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        // Очистка коллекции перед импортом
        Article::query()->delete();

        $path = storage_path('app/arxiv_dataset.json');

        // Проверка существования файла
        if (!file_exists($path)) {
            echo "Файл arxiv_dataset.json не найден по пути: $path\n";
            return;
        }

        // Чтение и декодирование JSON
        $json = file_get_contents($path);
        $data = json_decode($json, true);

        if (!$data || !is_array($data)) {
            echo "Не удалось прочитать или декодировать JSON.\n";
            return;
        }

        // Импорт записей
        foreach ($data as $entry) {
            Article::create([
                'title' => $entry['title'] ?? 'Без названия',
                'abstract' => $entry['abstract'] ?? '',
                'tags' => $entry['tags'] ?? [],
                'author' => $entry['author'] ?? 'Unknown',
                'date' => $entry['date'] ?? now(),
            ]);
        }

        echo "Импорт завершён успешно. Импортировано статей: " . count($data) . "\n";
    }
}
