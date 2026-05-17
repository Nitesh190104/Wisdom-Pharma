import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [tab, setTab] = useState('consumer');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      toast.success(res.message || 'Login successful!');
      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'store') navigate('/store');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const tabs = [
    { id: 'consumer', label: 'Consumer' },
    { id: 'store', label: 'Medical Store' },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-1">
        {tab === 'store' ? 'Store Login' : 'Welcome Back'}
      </h2>
      <p className="text-sm text-slate-500 mb-6">Enter your credentials to continue</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input {...register('email', { required: 'Email is required' })} type="email"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            placeholder="your@email.com" />
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <input {...register('password', { required: 'Password is required' })} type="password"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            placeholder="••••••••" />
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 shadow-sm">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">Register</Link>
      </p>
    </div>
  );
}
