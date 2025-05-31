import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

const ModePieChart = ({ data }) => {
  const chartData = (data.volume_by_mode ?? []).map(item => ({
    ...item,
    total_volume: Number(item.total_volume),
  }));

  const totalVolume = chartData.reduce((sum, item) => sum + item.total_volume, 0);

  const renderLabel = ({ value }) => `${value.toLocaleString()} cm³`;

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md text-center text-gray-500">
        <p>No shipment volume data available.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        Shipment Volume by Mode ({totalVolume.toLocaleString()} cm³)
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total_volume"
              nameKey="mode"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderLabel}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toLocaleString()} cm³`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModePieChart;
