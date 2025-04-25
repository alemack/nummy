<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

//        User::factory()->create([
//            'name' => 'Test User',
//            'email' => 'test@example.com',
//        ]);

        // TODO: автоматизировать обязательно
        /**
         * После fetch_arxiv.py и актуализации arxiv_dataset.json
         * Раскоментировать сначала ArticleSeeder и заполнить базу
         * После выкачить articles_export.json ручками из mongoDb содержимое
         * Передать их в build_normalized_articles.py , там получить
         * normalized_articles.json и передать уже их в build_synonyms.py и получить
         * query_synonyms.json.
         * И потом и query_synonyms.json, и normalized_articles.json переместить в
         * storage app и уже только после этого раскоментировать NormalizedArticleSeeder
         * и заполнить базу вторую
         */
//        $this->call([ArticleSeeder::class,]);
//        $this->call(NormalizedArticleSeeder::class);
        // $this->call(MongoInitialSeeder::class);


        // 1) Сначала импортируем «сырые» статьи из arxiv_dataset.json
        // $this->call(\Database\Seeders\ArticleSeeder::class);

        // 2) Нормализуем эти статьи (build_normalized_articles.py → normalized_articles.json)
        // $this->call(\Database\Seeders\NormalizedArticleSeeder::class);

        // 3) Словарь синонимов (build_synonyms.py → query_synonyms.json)
        //    Если у вас есть сидер для него — вызовите его здесь:
        // $this->call(\Database\Seeders\SynonymsSeeder::class);

        // 4) Наконец, базовый пользователь + его настройки/логи/сохранённые запросы
        // $this->call(\Database\Seeders\MongoInitialSeeder::class);
    }
}

