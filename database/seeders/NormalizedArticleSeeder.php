<?php

namespace Database\Seeders;

use App\Models\NormalizedArticle;
use Illuminate\Database\Seeder;
use MongoDB\BSON\ObjectId;

class NormalizedArticleSeeder extends Seeder
{
    public function run(): void
    {
        // Очищаем коллекцию
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

        $imported = 0;
        $skipped = 0;
        $batch = [];

        foreach ($data as $i => $entry) {
            // Получаем строковый _id (или из id, если надо)
            $id = $entry['_id'] ?? $entry['id'] ?? null;
            // Приводим к строке
            if (is_array($id) && isset($id['$oid'])) {
                $id = $id['$oid'];
            }

            // Проверяем валидность _id
            if (!$id || strlen($id) !== 24 || !ctype_xdigit($id)) {
                echo "Пропущена запись без валидного _id на позиции $i\n";
                $skipped++;
                continue;
            }

            $batch[] = [
                '_id'              => new ObjectId($id),
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
                'id'               => $entry['id'] ?? null,
            ];
            $imported++;

            if ($imported % 1000 === 0) {
                NormalizedArticle::insert($batch);
                $batch = [];
                echo "Импортировано $imported записей...\n";
            }
        }

        // Вставляем остатки
        if (!empty($batch)) {
            NormalizedArticle::insert($batch);
        }

        echo "Импорт завершён: $imported успешно, $skipped пропущено.\n";
    }
}
