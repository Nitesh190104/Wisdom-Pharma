export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700' },
  returned: { label: 'Returned', color: 'bg-slate-100 text-slate-700' },
};

export const PAYMENT_METHODS = [
  { value: 'cod',  label: 'Cash on Delivery' },
  { value: 'upi',  label: 'UPI / Online Payment' },
];

export const ROLES = { CONSUMER: 'consumer', STORE: 'store', ADMIN: 'admin' };
