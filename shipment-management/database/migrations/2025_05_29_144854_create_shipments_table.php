<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->unsignedInteger('shipment_id')->primary(); // Explicit primary key
            $table->unsignedInteger('customer_id');
            $table->string('origin', 2); // Two-letter US state code
            $table->enum('destination', ['GUY', 'SVG', 'SLU', 'BIM', 'DOM', 'GRD', 'SKN', 'ANU', 'SXM', 'FSXM']);
            $table->unsignedInteger('weight');
            $table->unsignedInteger('volume');
            $table->enum('carrier', ['FEDEX', 'DHL', 'USPS', 'UPS', 'AMAZON']);
            $table->enum('mode', ['air', 'sea']);
            $table->enum('status', ['received', 'intransit', 'delivered'])->index();
            $table->date('arrival_date');
            $table->date('departure_date')->nullable(); // Only populated for 'intransit' and 'delivered'
            $table->date('delivered_date')->nullable(); // Only populated for 'delivered'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
