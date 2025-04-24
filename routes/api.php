<?php

use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', [TestController::class, 'ping']);

Route::get('/search', [SearchController::class, 'search']);

Route::get('/run-evaluation', [MetricsController::class, 'runEvaluation']);
