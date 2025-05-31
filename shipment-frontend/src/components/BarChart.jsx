import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function ReceivedBarChart() {
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // 'all' or '30'

  const carrierColors = {
    FEDEX: '#1f77b4',
    DHL: '#ff7f0e',
    USPS: '#2ca02c',
    UPS: '#d62728',
    AMAZON: '#9467bd'
  };

  const filterLast30Days = (data) => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= thirtyDaysAgo;
    });
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/insights')
      .then(res => res.json())
      .then(raw => {
        const grouped = {};

        raw.received_by_carrier.forEach(({ carrier, arrival_date, count }) => {
          if (!grouped[arrival_date]) {
            grouped[arrival_date] = { date: arrival_date };
          }
          grouped[arrival_date][carrier] = (grouped[arrival_date][carrier] || 0) + count;
        });

        let formattedData = Object.values(grouped).sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        );

        if (timeRange === '30') {
          formattedData = filterLast30Days(formattedData);
        }

        setData(formattedData);
      })
      .catch(error => {
        console.error("Error fetching received shipment data:", error);
        setData([]);
      });
  }, [timeRange]);

  return (
    <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-xl mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Received Shipments per Carrier
        </h3>
        <select
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
          className="border rounded p-1 text-sm"
        >
          <option value="all">All Time</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: data.length * 50, height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
              barCategoryGap={10}
              barGap={2}
            >
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
              {Object.keys(carrierColors).map(carrier => (
                <Bar key={carrier} dataKey={carrier} stackId="a" fill={carrierColors[carrier]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
