<?php

namespace App\Models;


use MongoDB\Laravel\Eloquent\Model;

class Article extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'articles';
    protected $fillable = [
        'title',
        'abstract',
        'tags',
        'authors',        // массив имён
        'affiliations',   // массив аффилиаций
        'date',
        'updated',
        'arxiv_id',
        'primary_category',
        'categories',     // массив
        'doi',
        'pdf_url',
        'comment',
        'journal_ref',
        'lang'
    ];
}
