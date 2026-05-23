import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Metric {
  id: number;
  name: string;
  unit: string | null;
}

interface Record {
  id: number;
  dependent_id: number;
  metric: Metric;
  date: string;
  value: string;
  comment: string | null;
}

interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
}

export const Health = () => {
  const { id } = useParams<{ id: string }>();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedDependentId, setSelectedDependentId] = useState<number | null>(null);

  const [records, setRecords] = useState<Record[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [metricName, setMetricName] = useState('');
  const [metricUnit, setMetricUnit] = useState('');
  const [value, setValue] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDependents = async () => {
      try {
        const res = await api.get('/dependents/');
        setDependents(res.data);

        if (id) {
          setSelectedDependentId(parseInt(id));
        } else if (res.data.length > 0) {
          setSelectedDependentId(res.data[0].id);
        } else {
          setLoading(false); // No dependents
        }
      } catch (err: any) {
        setError('Failed to load dependents');
        console.error(err);
        setLoading(false);
      }
    };

    fetchDependents();
  }, [id]);

  useEffect(() => {
    if (selectedDependentId !== null) {
      fetchData(selectedDependentId);
    }
  }, [selectedDependentId]);

  const fetchData = async (dependentId: number) => {
    setLoading(true);
    try {
      const [recordsRes, metricsRes] = await Promise.all([
        api.get(`/health/records/?dependent_id=${dependentId}`),
        api.get('/health/metrics/')
      ]);
      setRecords(recordsRes.data);
      setMetrics(metricsRes.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load health data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    if (selectedId) {
      const metric = metrics.find(m => m.id === selectedId);
      if (metric) {
        setMetricName(metric.name);
        setMetricUnit(metric.unit || '');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (selectedDependentId === null) {
      setFormError('No dependent selected');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/health/records/', {
        dependent_id: selectedDependentId,
        date,
        metric_name: metricName,
        metric_unit: metricUnit,
        value,
        comment
      });

      // Reset form
      setMetricName('');
      setMetricUnit('');
      setValue('');
      setComment('');

      // Refresh data
      fetchData(selectedDependentId);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to add health record');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group records by metric for charts
  const chartDataByMetric = React.useMemo(() => {
    const grouped: { [key: string]: { name: string, unit: string, data: any[] } } = {};

    // Process records in chronological order for charts (reverse of the default API ordering which is newest first)
    const sortedRecords = [...records].reverse();

    sortedRecords.forEach(record => {
      // Check if value is numeric
      const numericValue = parseFloat(record.value);
      if (!isNaN(numericValue)) {
        if (!grouped[record.metric.name]) {
          grouped[record.metric.name] = {
            name: record.metric.name,
            unit: record.metric.unit || '',
            data: []
          };
        }

        grouped[record.metric.name].data.push({
          date: record.date,
          value: numericValue,
          fullRecord: record
        });
      }
    });

    return grouped;
  }, [records]);

  if (loading && selectedDependentId === null && dependents.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!loading && dependents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Health Data</h1>
          <Link to="/dependents" className="text-indigo-600 hover:text-indigo-800">
            &larr; Back to Dependents
          </Link>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center text-gray-500">
          Keine Werte vorhanden. Bitte erstellen Sie zuerst einen Dependent (Abhängigen).
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Health Data</h1>
        <Link to="/dependents" className="text-indigo-600 hover:text-indigo-800">
          &larr; Back to Dependents
        </Link>
      </div>

      {dependents.length > 1 && (
        <div className="mb-6">
          <label htmlFor="dependent-select" className="block text-sm font-medium text-gray-700">
            Select Dependent
          </label>
          <select
            id="dependent-select"
            value={selectedDependentId || ''}
            onChange={(e) => setSelectedDependentId(parseInt(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {dependents.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.first_name} {dep.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">Loading data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Record</h2>
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Metric (Select or Type New)</label>
                <div className="flex gap-2 mb-2">
                  <select
                    onChange={handleMetricSelect}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Select existing...</option>
                    {metrics.map(m => (
                      <option key={m.id} value={m.id}>{m.name} {m.unit ? `(${m.unit})` : ''}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weight, Height"
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Unit (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. kg, cm"
                  value={metricUnit}
                  onChange={(e) => setMetricUnit(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="text"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Record'}
              </button>
            </form>
          </div>
        </div>

          {/* Charts and Data Column */}
          <div className="md:col-span-2 space-y-6">
            {Object.keys(chartDataByMetric).length > 0 ? (
              Object.values(chartDataByMetric).map((metricData) => (
                <div key={metricData.name} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {metricData.name} {metricData.unit ? `(${metricData.unit})` : ''} - Trend
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metricData.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#4f46e5" activeDot={{ r: 8 }} name={metricData.name} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                No numerical data available to display charts.
              </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Records</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {records.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {records.map((record) => (
                      <li key={record.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {record.metric.name} {record.metric.unit ? `(${record.metric.unit})` : ''}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              <span className="font-semibold text-gray-900">{record.value}</span>
                              {record.comment && <span className="ml-2 italic">- {record.comment}</span>}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-gray-500 text-center">No records found. Add one above.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
