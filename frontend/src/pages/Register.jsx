import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [role, setRole] = useState('consumer');
  const { register: registerUser, loading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      data.role = role;
      const res = await registerUser(data);
      toast.success(res.message || 'Registration successful!');
      if (role === 'store') toast('Your business account is pending admin approval.', { icon: 'ℹ️' });
      navigate(role === 'store' ? '/store' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400";

  return (
    <div>
      {/* Role Toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
        {[['consumer', 'Consumer'], ['store', 'Medical Store']].map(([id, label]) => (
          <button key={id} onClick={() => setRole(id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === id ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-1">Create Account</h2>
      <p className="text-sm text-slate-500 mb-6">{role === 'store' ? 'Register your medical store' : 'Sign up to start shopping'}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input {...register('name', { required: 'Required' })} className={inputClass} placeholder="Full name" />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input {...register('phone', { required: 'Required' })} className={inputClass} placeholder="Phone number" />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} type="email" className={inputClass} placeholder="your@email.com" />
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} type="password" className={inputClass} placeholder="••••••••" />
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input {...register('password_confirmation', { required: 'Required' })} type="password" className={inputClass} placeholder="••••••••" />
          </div>
        </div>

        {/* Store-specific fields */}
        {role === 'store' && (
          <>
            <hr className="border-slate-200" />
            <p className="text-sm font-semibold text-slate-700">Business Details</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
              <input {...register('business_name', { required: role === 'store' ? 'Required' : false })} className={inputClass} placeholder="Your Medical Store name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                <input {...register('gst_number', { required: role === 'store' ? 'Required' : false })} className={inputClass} placeholder="GST number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drug License No.</label>
                <input {...register('drug_license_number', { required: role === 'store' ? 'Required' : false })} className={inputClass} placeholder="License number" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
              <input {...register('business_address')} className={inputClass} placeholder="Street address" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input {...register('business_city')} className={inputClass} placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input {...register('business_state')} className={inputClass} placeholder="State" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input {...register('business_pincode')} className={inputClass} placeholder="Pincode" />
              </div>
            </div>
          </>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 shadow-sm">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
