<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShipmentController;

Route::post('upload', [ShipmentController::class, 'upload']);

Route::get('/insights', [ShipmentController::class, 'insights']);

Route::get('/shipments', [ShipmentController::class, 'listShipments']);

Route::get('/shipment/{id}', [ShipmentController::class, 'shipmentDetails']);
