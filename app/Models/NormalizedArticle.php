<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class NormalizedArticle extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'normalized_articles';

    protected $primaryKey = '_id';
    public $incrementing = false;
    protected $keyType = 'string'; // можно оставить string — ObjectId подхватится драйвером

    protected $fillable = [
        '_id',
        'title',
        'abstract',
        'tags',
        'authors',
        'affiliations',
        'date',
        'updated',
        'arxiv_id',
        'primary_category',
        'categories',
        'doi',
        'pdf_url',
        'comment',
        'journal_ref',
        'lang',
    ];

    protected $casts = [
        'tags'         => 'array',
        'authors'      => 'array',
        'affiliations' => 'array',
        'categories'   => 'array',
    ];
}
