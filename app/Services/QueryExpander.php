<?php

namespace App\Services;


// App\Services\QueryExpander.php
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
     * Expands a given query string with additional terms and their associated weights
     * by searching the dictionary for synonyms.
     *
     * @param string $query The search term to expand.
     * @return array An array of terms with their respective weights.
     */
    public function expandWithWeights(string $query): array
    {
        $expanded = [['term' => $query, 'weight' => 1.0]];

        foreach ($this->dictionary as $key => $synonyms) {
            if (mb_strtolower($key) === mb_strtolower($query)) {
                foreach ($synonyms as [$synTerm, $weight]) {
                    $expanded[] = ['term' => $synTerm, 'weight' => floatval($weight)];
                }
                break;
            }
        }

        return $expanded;
    }
}

