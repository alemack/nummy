<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class SearchLog extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'search_logs';

    protected $fillable = [
        'query',
        'expanded',
        'lemmas',
        'expanded_terms',
        'normalized_terms',
        'result_count',
        'duration',
    ];

    protected $casts = [
        'expanded'         => 'boolean',
        'lemmas'           => 'boolean',
        'expanded_terms'   => 'array',
        'normalized_terms' => 'array',
        'result_count'     => 'integer',
        'duration'         => 'float',
    ];
}
