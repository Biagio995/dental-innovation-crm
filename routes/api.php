<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommunicationLogController;
use App\Http\Controllers\Api\MessageTemplateController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\RecallController;
use App\Http\Controllers\Api\VisitController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('patients', PatientController::class);

    Route::apiResource('appointments', AppointmentController::class);
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])
        ->name('appointments.update-status');

    Route::get('/visits', [VisitController::class, 'index'])->name('visits.index');
    Route::get('/visits/{visit}', [VisitController::class, 'show'])->name('visits.show');
    Route::post('/appointments/{appointment}/complete', [VisitController::class, 'complete'])
        ->name('appointments.complete');

    Route::apiResource('message-templates', MessageTemplateController::class);
    Route::post('/message-templates/{message_template}/preview', [MessageTemplateController::class, 'preview'])
        ->name('message-templates.preview');

    Route::get('/recalls/queue', [RecallController::class, 'queue'])->name('recalls.queue');
    Route::post('/recalls/generate-from-visits', [RecallController::class, 'generateFromVisits'])
        ->name('recalls.generate-from-visits');
    Route::apiResource('recalls', RecallController::class);
    Route::post('/recalls/{recall}/contact-outcome', [RecallController::class, 'recordOutcome'])
        ->name('recalls.contact-outcome');

    Route::apiResource('communication-logs', CommunicationLogController::class)->except(['update']);
    Route::patch('/communication-logs/{communication_log}/status', [CommunicationLogController::class, 'updateStatus'])
        ->name('communication-logs.update-status');
});
