<?php

namespace App\Services;

class QueryExpander
{
    protected array $dictionary = [];

    public function __construct() {
        $this->loadDictionary();
    }

    protected function loadDictionary(): void {
        $json = file_get_contents(storage_path('app/query_synonyms.json'));
        $this->dictionary = json_decode($json, true) ?? [];
    }

    /**
     * Нормализует строку: приводит к нижнему регистру, убирает пробелы, дефисы и подчёркивания.
     * Например:
     * - "multi-agent systems" → "multiagentsystems"
     * - "MultiAgent_Systems"  → "multiagentsystems"
     * - "multi agent systems" → "multiagentsystems"
     */
    protected function normalize($str) {
        $str = mb_strtolower($str);
        $str = str_replace(['-', '_', ' '], '', $str); // убирает дефисы, подчёркивания и пробелы полностью
        return $str;
    }

    /**
     * Expands a given query string with additional terms and their associated weights
     * by searching the dictionary for synonyms.
     *
     * @param string $query The search term to expand.
     * @return array An array of terms with their respective weights.
     */
    public function expandWithWeights(string $query): array
    {
        $expanded = [['term' => $query, 'weight' => 1.0]];
        $queryNorm = $this->normalize($query);

        foreach ($this->dictionary as $key => $synonyms) {
            $keyNorm = $this->normalize($key);
            if ($keyNorm === $queryNorm) {
                foreach ($synonyms as [$synTerm, $weight]) {
                    $expanded[] = ['term' => $synTerm, 'weight' => floatval($weight)];
                }
                break;
            }
        }

        return $expanded;
    }
}
