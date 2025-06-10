<?php
// app/Services/NewsApiService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NewsApiService
{
    protected string $apiKey;
    protected string $endpoint;

    public function __construct()
    {
        $this->apiKey   = config('services.newsapi.key');
        $this->endpoint = config('services.newsapi.endpoint');

        if (! $this->apiKey) {
            Log::error('[NewsApiService] NEWSAPI_KEY not set in .env');
        }
    }

    /**
     * Поиск статей в NewsAPI по теме.
     *
     * @param string $query  Строка поискового запроса
     * @param int    $limit  Сколько записей вернуть (макс. 100)
     * @return array         Массив статей из ответа API
     */
    public function search(string $query, int $limit = 5): array
    {
        try {
            $response = Http::get($this->endpoint, [
                'q'        => $query,
                'pageSize' => $limit,
                'sortBy'   => 'publishedAt',
                'language' => 'en',
                'apiKey'   => $this->apiKey,
            ]);

            if ($response->successful()) {
                $json = $response->json();
                return $json['articles'] ?? [];
            }

            Log::error('[NewsApiService] Failed response: ' . $response->body());
        } catch (\Throwable $e) {
            Log::error('[NewsApiService] Exception: ' . $e->getMessage());
        }

        return [];
    }
}
