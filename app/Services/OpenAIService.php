<?php

namespace App\Services;

use OpenAI;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected $client;

    public function __construct()
    {
        try {
            $this->client = OpenAI::client(env('OPENAI_API_KEY'));
        } catch (\Throwable $e) {
            Log::error("Ошибка инициализации OpenAI client: " . $e->getMessage());
            throw $e;
        }
    }

    public function suggestKeywords(string $topic): array
    {
        $prompt = <<<PROMPT
Пользователь хочет найти статьи по теме: "{$topic}".
Сформируй на английском языке 5–10 ключевых слов для поиска научных статей по этой теме, через запятую.
Не добавляй никакого лишнего текста, только ключевые слова через запятую.
PROMPT;

        try {
            $result = $this->client->chat()->create([
                'model' => 'gpt-4-turbo',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.2,
                'max_tokens' => 64,
            ]);

            $content = $result['choices'][0]['message']['content'] ?? '';
            Log::info("OpenAI ответ для '{$topic}': " . $content);

            // Разбиваем по запятым
            return array_map('trim', explode(',', $content));
        } catch (\Throwable $e) {
            Log::error("Ошибка в suggestKeywords (OpenAI): " . $e->getMessage());
            return []; // Можно также возвращать ошибку в UI, если нужно
        }
    }
}
