import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { getDashboardData } from '../../api/assistant';
import type { AssistantDashboardData } from '../../types/assistant';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AssistantDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<AssistantDashboardData | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData(year);
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };
    fetchData();
  }, [year]);

  if (!data) return <div>{t('loading') || 'Loading...'}</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('assistants_dashboard') || 'Assistants Dashboard'}</h1>
        <select
          className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
          <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('monthly_costs') || 'Monthly Costs'}</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_costs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_cost" fill="#0d9488" name={t('total_cost') || 'Total Cost'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('costs_by_type') || 'Costs by Employment Type'}</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.type_breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cost"
                  nameKey="type"
                >
                  {data.type_breakdown.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
