import { useEffect, useReducer, Component } from 'react';
import { HiOutlineCurrencyRupee, HiOutlineClipboardList, HiOutlineUsers, HiOutlineCube } from 'react-icons/hi';
import { adminService } from '../services';
import { formatCurrency } from '../utils/formatters';
import { StatsCard, Badge, LoadingSpinner } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Class Component — demonstrates React class component concept
class RevenueChartClass extends Component {
  constructor(props) {
    super(props);
    this.state = { animate: false };
  }
  componentDidMount() {
    setTimeout(() => this.setState({ animate: true }), 200);
  }
  render() {
    const { data } = this.props;
    if (!data?.length) return null;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

const COLORS = ['#f59e0b', '#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f43f5e'];

// Demonstrates useReducer
const initialState = { data: null, loading: true, error: null };
function dashboardReducer(state, action) {
  switch (action.type) {
    case 'FETCH_SUCCESS': return { ...state, data: action.payload, loading: false };
    case 'FETCH_ERROR': return { ...state, error: action.payload, loading: false };
    default: return state;
  }
}

export default function AdminDashboard() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  useEffect(() => {
    adminService.getDashboard()
      .then(res => dispatch({ type: 'FETCH_SUCCESS', payload: res.data.data }))
      .catch(err => dispatch({ type: 'FETCH_ERROR', payload: err.message }));
  }, []);

  if (state.loading) return <LoadingSpinner size="lg" text="Loading analytics..." />;
  if (!state.data) return <p className="text-center text-slate-500 py-10">Failed to load dashboard data.</p>;

  const { revenue, orders, users, inventory, recent_orders } = state.data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your pharmaceutical platform</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard icon={HiOutlineCurrencyRupee} label="Total Revenue" value={formatCurrency(revenue.total)} color="primary" />
        <StatsCard icon={HiOutlineClipboardList} label="Total Orders" value={orders.total} color="emerald" />
        <StatsCard icon={HiOutlineUsers} label="Total Users" value={users.total} color="amber" />
        <StatsCard icon={HiOutlineCube} label="Total Medicines" value={inventory.total_medicines} color="rose" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChartClass data={revenue.chart} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Order Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={orders.stats.filter(s => s.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {orders.stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{orders.processing !== undefined ? orders.processing : orders.pending}</p>
          <p className="text-sm text-blue-600">Processing Orders</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{orders.delivered}</p>
          <p className="text-sm text-emerald-600">Delivered</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-rose-700">{inventory.low_stock}</p>
          <p className="text-sm text-rose-600">Low Stock Items</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{users.pending_approvals}</p>
          <p className="text-sm text-blue-600">Pending Approvals</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-medium text-slate-500">Order #</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Total</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
            </tr></thead>
            <tbody>
              {(recent_orders || []).map((order, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{order.order_number}</td>
                  <td className="py-3 px-4 text-slate-600">{order.customer}</td>
                  <td className="py-3 px-4"><span className="capitalize text-slate-600">{order.type}</span></td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(order.total)}</td>
                  <td className="py-3 px-4"><Badge status={order.status} /></td>
                  <td className="py-3 px-4 text-slate-500">{order.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
