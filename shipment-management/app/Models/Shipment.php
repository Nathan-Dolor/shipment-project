<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    /** @use HasFactory<\Database\Factories\ShipmentFactory> */
    use HasFactory;

    protected $table = 'shipments';             // Explicit table name
    protected $primaryKey = 'shipment_id';      // Use custom primary key
    public $incrementing = false;               // Not auto-incrementing
    protected $keyType = 'int';                 // Primary key is an integer
}
