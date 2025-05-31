import { useEffect, useState } from 'react';
import SummaryStats from '../components/SummaryStats';
import ModePieChart from '../components/PieChart';
import ShipmentsTable from '../components/ShipmentsTable';
import BarChart from '../components/BarChart';

function Dashboard() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('http://localhost:8000/api/insights');
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        setInsights(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>Error loading dashboard: {error}</p>;


  return (
  <div className="p-6 max-w-6xl mx-auto">
    <h1 className="text-3xl mb-6 font-bold text-center">Dashboard</h1>

    <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">
      <div className="w-full lg:w-1/3">
        <div className="h-full">
          <SummaryStats data={insights} />
        </div>
      </div>
      <div className="w-full lg:w-2/3">
        <div className="h-full bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col">
          <ModePieChart data={insights} />
        </div>
      </div>
    </div>

    <BarChart />
    <ShipmentsTable />
  </div>
);




}

export default Dashboard;
