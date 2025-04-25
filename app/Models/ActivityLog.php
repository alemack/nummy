<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class ActivityLog extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'activity_logs';

    protected $fillable = [
        'user_id',
        'timestamp',
        'description',
    ];

    protected $casts = [
        'user_id'  => 'objectId',
        'timestamp'=> 'datetime',
    ];
}
