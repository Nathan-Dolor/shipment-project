export default function SummaryStats({ data }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Shipments</h3>
        <p className="text-2xl font-bold text-gray-900">{data.total_shipments ?? '-'}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Warehouse Utilization</h3>
        <p className="text-2xl font-bold text-gray-900">
          {(data.warehouse_utilization * 100).toFixed(2)}%
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Volume</h3>
        <p className="text-2xl font-bold text-gray-900">
          {data.total_volume != null ? `${data.total_volume} cm³` : '-'}
        </p>
      </div>
    </div>
  );
}
