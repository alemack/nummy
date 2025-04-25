<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class SavedQuery extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'saved_queries';

    protected $fillable = [
        'user_id',
        'query',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'user_id' => 'objectId',
    ];
}
