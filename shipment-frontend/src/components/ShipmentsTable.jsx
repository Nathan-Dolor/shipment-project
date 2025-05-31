import { useEffect, useState, useCallback } from 'react';

function ShipmentsTable() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', destination: '', carrier: '' });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [sort, setSort] = useState({ sort_by: '', sort_order: 'asc' });
  const destinations = ['GUY', 'SVG', 'SLU', 'BIM', 'DOM', 'GRD', 'SKN', 'ANU', 'SXM', 'FSXM'];
  const carriers = ['FEDEX', 'DHL', 'USPS', 'UPS', 'AMAZON'];
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchShipments = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      search: debouncedSearch,
      status: filters.status,
      destination: filters.destination,
      carrier: filters.carrier,
      sort_by: sort.sort_by,
      sort_order: sort.sort_order,
      page,
    });

    try {
      const res = await fetch(`http://localhost:8000/api/shipments?${params}`);
      const data = await res.json();
      setShipments(data.data);
      setPagination({ current_page: data.current_page, last_page: data.last_page });
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
      setShipments([]);
      setPagination({ current_page: 1, last_page: 1 });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, sort]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handlePageChange = (page) => {
    if (page !== pagination.current_page && page >= 1 && page <= pagination.last_page) {
      fetchShipments(page);
    }
  };

  const toggleSort = (column) => {
    setSort((prev) => ({
      sort_by: column,
      sort_order: prev.sort_by === column && prev.sort_order === 'asc' ? 'desc' : 'asc',
    }));
  };

  useEffect(() => {
  if (!selectedShipmentId) {
    setShipmentDetails(null);
    return;
  }
  setDetailsLoading(true);
  fetch(`http://localhost:8000/api/shipment/${selectedShipmentId}`)
    .then(res => res.json())
    .then(data => setShipmentDetails(data))
    .catch(err => {
      console.error('Failed to fetch shipment details:', err);
      setShipmentDetails(null);
    })
    .finally(() => setDetailsLoading(false));
}, [selectedShipmentId]);


  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Shipments</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="p-2 border rounded w-full sm:w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 border rounded"
          value={filters.status}
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="received">Received</option>
          <option value="intransit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>

        <select
          value={filters.destination}
          onChange={e => setFilters(prev => ({ ...prev, destination: e.target.value }))}
          className="border rounded px-2 py-1"
        >
          <option value="">All Destinations</option>
          {destinations.map(dest => (
            <option key={dest} value={dest}>{dest}</option>
          ))}
        </select>

        <select
          value={filters.carrier}
          onChange={e => setFilters(prev => ({ ...prev, carrier: e.target.value }))}
          className="border rounded px-2 py-1"
        >
          <option value="">All Carriers</option>
          {carriers.map(carrier => (
            <option key={carrier} value={carrier}>{carrier}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : shipments.length === 0 ? (
        <p className="text-center italic">No shipments found.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {['shipment_id', 'origin', 'destination', 'carrier', 'status'].map((col) => (
                <th
                  key={col}
                  className={`p-2 border cursor-pointer hover:bg-gray-200 ${
                    sort.sort_by === col ? 'bg-blue-100 font-semibold' : ''
                  }`}
                  onClick={() => toggleSort(col)}
                >
                  {col.replace('_', ' ').toUpperCase()}{' '}
                  {sort.sort_by === col ? (sort.sort_order === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
                <tr
                key={shipment.shipment_id}
                className="text-center border-t cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedShipmentId(shipment.shipment_id)}
                >
                <td className="p-2 border">{shipment.shipment_id}</td>
                <td className="p-2 border">{shipment.origin}</td>
                <td className="p-2 border">{shipment.destination}</td>
                <td className="p-2 border">{shipment.carrier}</td>
                <td className="p-2 border capitalize">{shipment.status}</td>
                </tr>
            ))}
          </tbody>

        </table>
      )}

      {pagination.last_page > 1 && (
  <div className="mt-4 flex justify-center gap-2 items-center">
    <button
      className="px-3 py-1 rounded border bg-white text-blue-500 hover:bg-gray-100 disabled:opacity-50"
      onClick={() => handlePageChange(pagination.current_page - 1)}
      disabled={pagination.current_page === 1 || loading}
    >
      Previous
    </button>

    {[...Array(pagination.last_page)].map((_, i) => (
      <button
        key={i + 1}
        className={`px-3 py-1 rounded border transition ${
          pagination.current_page === i + 1
            ? '!bg-gray-200 font-bold text-gray-900'
            : 'bg-white text-blue-500 hover:bg-gray-100'
        }`}
        onClick={() => handlePageChange(i + 1)}
        disabled={loading}
      >
        {i + 1}
      </button>
    ))}

    <button
      className="px-3 py-1 rounded border bg-white text-blue-500 hover:bg-gray-100 disabled:opacity-50"
      onClick={() => handlePageChange(pagination.current_page + 1)}
      disabled={pagination.current_page === pagination.last_page || loading}
    >
      Next
    </button>
  </div>
)}


      {selectedShipmentId && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button
                onClick={() => setSelectedShipmentId(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
                ✕
            </button>

            {detailsLoading ? (
                <p>Loading details...</p>
            ) : shipmentDetails ? (
                <div>
                <h3 className="text-xl font-semibold mb-4">Shipment Details</h3>
                <div className="space-y-2">
                    <div><strong>Shipment ID:</strong> {shipmentDetails.shipment_id}</div>
                    <div><strong>Origin:</strong> {shipmentDetails.origin}</div>
                    <div><strong>Destination:</strong> {shipmentDetails.destination}</div>
                    <div><strong>Carrier:</strong> {shipmentDetails.carrier}</div>
                    <div><strong>Status:</strong> {shipmentDetails.status}</div>
                    <div><strong>Weight:</strong> {shipmentDetails.weight}g</div>
                    <div><strong>Volume:</strong> {shipmentDetails.volume}cm³</div>
                    <div><strong>Arrival Date:</strong> {shipmentDetails.arrival_date}</div>
                    <div><strong>Departure Date:</strong> {shipmentDetails.departure_date || 'Not departed yet'}</div>
                    <div><strong>Delivered Date:</strong> {shipmentDetails.delivered_date || 'Not delivered yet'}</div>
                </div>
                </div>
            ) : (
                <p>Failed to load details.</p>
            )}
            </div>
        </div>
      )}


    </div>
  );
}

export default ShipmentsTable;
