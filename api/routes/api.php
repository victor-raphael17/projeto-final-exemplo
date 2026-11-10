<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\GenreController;
use Illuminate\Support\Facades\Route;

Route::post('register', [AuthController::class, 'register'])
    ->middleware('throttle:6,1');

Route::post('login', [AuthController::class, 'login'])
    ->middleware('throttle:6,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::apiResource('genres', GenreController::class)
        ->whereNumber('genre');

    Route::apiResource('books', BookController::class)
        ->whereNumber('book');
});
