<?php

namespace App\Models;


use MongoDB\Laravel\Eloquent\Model;

class Article extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'articles';
    protected $fillable = ['title', 'abstract', 'tags', 'author', 'date'];
}
