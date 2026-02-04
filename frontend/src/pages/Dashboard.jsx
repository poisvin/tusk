import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { statsApi } from '../api/stats';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-white">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await statsApi.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const weekStart = format(new Date().getDay() === 0 ? new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) : new Date(Date.now() - (new Date().getDay() - 1) * 24 * 60 * 60 * 1000), 'MMM d');
  const weekEnd = format(new Date(), 'MMM d, yyyy');

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  const weeklyStats = stats?.weekly_stats || {};

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400">
          Weekly overview for {weekStart} - {weekEnd}
        </p>
      </div>

      {/* Weekly Stats Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">bar_chart</span>
          This Week
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            icon="assignment"
            label="Total Tasks"
            value={weeklyStats.total || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon="check_circle"
            label="Completed"
            value={weeklyStats.completed || 0}
            color="bg-green-500"
          />
          <StatCard
            icon="play_circle"
            label="In Progress"
            value={weeklyStats.in_progress || 0}
            color="bg-cyan-500"
          />
          <StatCard
            icon="history"
            label="Carried Over"
            value={weeklyStats.carried_over || 0}
            color="bg-orange-500"
          />
          <StatCard
            icon="block"
            label="Blocked"
            value={weeklyStats.blocked || 0}
            color="bg-red-500"
          />
          <StatCard
            icon="pending"
            label="Pending"
            value={weeklyStats.pending || 0}
            color="bg-slate-500"
          />
        </div>
      </div>

      {/* Notes Created */}
      <div className="mb-8">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 inline-flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">description</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{stats?.weekly_notes || 0}</p>
            <p className="text-slate-400">Notes created this week</p>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">trending_up</span>
          Monthly Activity
        </h2>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.monthly_data || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: '#334155' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Tasks Created"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Tasks Completed"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
