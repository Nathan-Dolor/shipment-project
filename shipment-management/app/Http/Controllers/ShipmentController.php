<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Http\Requests\StoreShipmentRequest;
use App\Http\Requests\UpdateShipmentRequest;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use League\Csv\Reader;
use Illuminate\Support\Facades\Log;

class ShipmentController extends Controller
{
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:csv,txt|max:20480',
            ]);

             $originalName = $request->file('file')->getClientOriginalName();

            $filename = uniqid() . '_' . $request->file('file')->getClientOriginalName();
            $destination = storage_path('app/csv');

            if (!file_exists($destination)) {
                mkdir($destination, 0755, true);
            }

            $fullPath = $request->file('file')->move($destination, $filename);
            $fullPath = $fullPath->getPathname();

            $result = $this->processCsv($fullPath);

            return response()->json([
                'message' => 'Upload and processing complete',
                'path' => $originalName,
                'processed' => $result['processed'],
                'skipped' => $result['skipped'],
            ]);
        } catch (\Throwable $e) {
            Log::error('Upload failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function processCsv(string $fullPath): array
    {

        $csv = Reader::createFromPath($fullPath, 'r');
        $csv->setHeaderOffset(0);

        $records = $csv->getRecords();
        $batch = [];
        $processed = 0;
        $skipped = 0;

        foreach ($records as $i => $record) {
            if (
                empty($record['shipment_id']) || empty($record['customer_id']) ||
                empty($record['origin']) || empty($record['destination']) ||
                empty($record['weight']) || empty($record['carrier']) ||
                empty($record['mode']) || empty($record['status']) ||
                empty($record['arrival_date'])
            ) {
                $skipped++;
                continue;
            }

            try {
                $batch[] = [
                    'shipment_id' => (int) $record['shipment_id'],
                    'customer_id' => (int) $record['customer_id'],
                    'origin' => strtoupper(trim($record['origin'])),
                    'destination' => strtoupper(trim($record['destination'])),
                    'weight' => (int) $record['weight'],
                    'volume' => (int) $record['volume'], // or calculate here
                    'carrier' => strtoupper(trim($record['carrier'])),
                    'mode' => strtolower(trim($record['mode'])),
                    'status' => strtolower(trim($record['status'])),
                    'arrival_date' => $record['arrival_date'],
                    'delivered_date' => empty($record['delivered_date']) ? null : $record['delivered_date'],
                    'departure_date' => empty($record['departure_date']) ? null : $record['departure_date'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $processed++;

                if (count($batch) >= 1000) {
                    DB::table('shipments')->upsert($batch, ['shipment_id']);
                    $batch = [];
                }
            } catch (\Throwable $e) {
                Log::warning("Row skipped due to error: " . $e->getMessage());
                $skipped++;
            }
        }

        // upsert for any remaining records < 1000
        if (!empty($batch)) {
            DB::table('shipments')->upsert($batch, ['shipment_id']);
        }

        return ['processed' => $processed, 'skipped' => $skipped];
    }

    public function insights()
    {
        $totalShipments = DB::table('shipments')->count();

        $totalVolume = DB::table('shipments')->sum('volume');

        // Assuming total warehouse capacity is 60,000,000,000 cm³.
        $warehouseCapacity = 60_000_000_000;
        $warehouseUtilization = ($totalVolume / $warehouseCapacity) * 100;

        $groupedShipments = DB::table('shipments')
            ->select('destination', 'departure_date', DB::raw('COUNT(*) as count'))
            ->whereNotNull('departure_date')
            ->groupBy('destination', 'departure_date')
            ->having('count', '>', 1)
            ->orderBy('count', 'desc')
            ->get();

        $upcomingDepartures = DB::table('shipments')
            ->whereDate('departure_date', '>=', now())
            ->orderBy('departure_date')
            ->limit(5)
            ->get();

        // Received counts per carrier per day
        $receivedCounts = DB::table('shipments')
            ->select('arrival_date', 'carrier', DB::raw('COUNT(*) as count'))
            ->groupBy('arrival_date', 'carrier')
            ->orderBy('arrival_date')
            ->get();

        // Shipment volume by mode (air/sea)
        $volumeByMode = DB::table('shipments')
            ->select('mode', DB::raw('SUM(volume) as total_volume'))
            ->groupBy('mode')
            ->get();

        return response()->json([
            'total_shipments' => $totalShipments,
            'total_volume' => $totalVolume,
            'warehouse_utilization' => round($warehouseUtilization, 2),
            'grouped_shipments' => $groupedShipments,
            'upcoming_departures' => $upcomingDepartures,
            'received_by_carrier' => $receivedCounts,
            'volume_by_mode' => $volumeByMode,
        ]);
    }

    public function listShipments(Request $request)
    {
        $query = DB::table('shipments');

        // General search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('shipment_id', 'like', "%$search%")
                ->orWhere('origin', 'like', "%$search%")
                ->orWhere('destination', 'like', "%$search%")
                ->orWhere('carrier', 'like', "%$search%")
                ->orWhere('status', 'like', "%$search%");
            });
        }

        // Specific filters
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($destination = $request->input('destination')) {
            $query->where('destination', $destination);
        }

        if ($carrier = $request->input('carrier')) {
            $query->where('carrier', $carrier);
        }

        // Optional sorting
        if ($sortBy = $request->input('sort_by')) {
            $sortOrder = $request->input('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('shipment_id', 'desc');
        }

        // Pagination
        $shipments = $query->paginate(25);

        return response()->json($shipments);
    }

    public function shipmentDetails($id)
    {
        $shipment = Shipment::find($id);

        if (!$shipment) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($shipment);
    }


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreShipmentRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Shipment $shipment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Shipment $shipment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateShipmentRequest $request, Shipment $shipment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Shipment $shipment)
    {
        //
    }
}
