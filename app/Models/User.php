<?php

namespace App\Models;

//use Jenssegers\Mongodb\Auth\User as Authenticatable;
//use Illuminate\Notifications\Notifiable;
//use Jenssegers\Mongodb\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use MongoDB\Laravel\Eloquent\Model;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Соединение, указанное в config/database.php
     */
    protected $connection = 'mongodb';

    /**
     * Название коллекции
     */
    protected $collection = 'users';

    /**
     * Поля, разрешённые для массового заполнения.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatarUrl',
    ];

    /**
     * Поля, скрытые при сериализации в JSON.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];
}
