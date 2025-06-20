<?php

use App\Http\Controllers\AIHelperController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\SavedQueriesController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\DataLoaderController;
use App\Http\Controllers\LogsController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\SearchLogsController;
use App\Http\Controllers\SynonymsController;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', [TestController::class, 'ping']);

Route::get('/search', [SearchController::class, 'search']);

Route::get('/run-evaluation', [MetricsController::class, 'runEvaluation']);
Route::get('/metrics-summary', [MetricsController::class, 'metricsSummary']);
Route::get('/search-logs-summary', [SearchLogsController::class, 'summary']);
Route::get('/search-logs-summary-per-query', [SearchLogsController::class, 'summaryPerQuery']);
Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
Route::get('/news', [NewsController::class, 'search']);
Route::get('/metrics-data', [MetricsController::class, 'metricsData']);


Route::get('/synonyms', [SynonymsController::class, 'index']);
Route::put('/synonyms/{term}', [SynonymsController::class,'update']);

Route::get('/logs', [LogsController::class, 'index']);
Route::get('/search-logs', [SearchLogsController::class, 'index']);



//Route::prefix('api')->group(function() {
    // профиль
    Route::get('/user',     [UserController::class, 'show']);
    Route::put('/user',     [UserController::class, 'update']);

    // настройки
    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update']);

    // сохранённые запросы
    Route::get('/saved-queries',    [SavedQueriesController::class, 'index']);
    Route::post('/saved-queries',   [SavedQueriesController::class, 'store']);
    Route::delete('/saved-queries/{id}', [SavedQueriesController::class, 'destroy']);

    // история активности
    Route::get('/activity', [ActivityController::class, 'index']);
//});

Route::post('/suggest-keywords', [AIHelperController::class, 'suggestKeywords']);

Route::post('/data-loader/run', [DataLoaderController::class, 'run']);
Route::post('/data-loader/import', [DataLoaderController::class, 'importArticles']);
Route::post('/data-loader/export-and-normalize', [DataLoaderController::class, 'exportAndNormalize']);
Route::post('/data-loader/import-normalized', [DataLoaderController::class, 'importNormalizedArticles']);
Route::post('/data-loader/build-synonyms', [DataLoaderController::class, 'buildSynonyms']);
Route::get('/article/{id}', [SearchController::class, 'getArticle']);
