<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class UserSetting extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'user_settings';

    protected $fillable = [
        'user_id',
        'dark_mode',
        'highlight_matches',
        'language',
    ];

    // Если вы храните user_id как ObjectId:
    protected $casts = [
        'user_id'           => 'objectId',
        'dark_mode'         => 'boolean',
        'highlight_matches' => 'boolean',
    ];
}
