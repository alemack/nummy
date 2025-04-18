<?php
//
//namespace App\Services;
//
//
//class old_QueryExpander
//{
//    protected array $dictionary = [];
//
//    public function __construct() {
//        $this->loadDictionary();
//    }
//
//    protected function loadDictionary() : void {
//        $json = file_get_contents(storage_path('app/query_synonyms.json'));
//        $this->dictionary = json_decode($json, true) ?? [];
//    }
//
//    public function expand(string $query) : array
//    {
//        $terms = [$query];
//
//        foreach ($this->dictionary as $key => $expansion) {
//            if(mb_strtolower($key) === mb_strtolower($query)) {
//                $terms = array_merge($terms, $expansion);
//                break;
//            }
//        }
//
//        return array_unique($terms);
//    }
//}
