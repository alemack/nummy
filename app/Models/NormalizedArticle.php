<?php

namespace App\Models;


use MongoDB\Laravel\Eloquent\Model;

class NormalizedArticle extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'normalized_articles';

    protected $primaryKey = '_id';
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'title',
        'abstract',
        'tags',
        'author',
        'date',
    ];
}
