import { useState, useEffect } from 'react';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { orderService } from '../services';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge, LoadingSpinner, EmptyState, Pagination, Modal } from '../components/ui';
import toast from 'react-hot-toast';

const getId = (item) => item?._id || item?.id;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 10 };
    if (statusFilter) params.status = statusFilter;
    orderService.getAll(params).then(res => {
      setOrders(res.data.data?.data || []);
      setTotalPages(res.data.data?.last_page || 1);
    }).catch(error => console.error('Failed to load orders', error)).finally(() => setLoading(false));
  }, [page, statusFilter]);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancel(id, 'Cancelled by user');
      toast.success('Order cancelled');
      setOrders(prev => prev.map(o => getId(o) === id ? { ...o, status: 'cancelled' } : o));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const openReturnModal = (id) => {
    setReturnOrderId(id);
    setReturnReason('');
    setReturnModalOpen(true);
  };

  const closeReturnModal = ({ force = false } = {}) => {
    if (returnSubmitting && !force) return;
    setReturnModalOpen(false);
    setReturnOrderId(null);
    setReturnReason('');
  };

  const submitReturn = async () => {
    const reason = returnReason.trim();
    if (!returnOrderId) return;
    if (!reason) {
      toast.error('Reason is required to request a return.');
      return;
    }

    setReturnSubmitting(true);
    try {
      await orderService.return(returnOrderId, reason);
      toast.success('Order return requested');
      setOrders(prev => prev.map(o => getId(o) === returnOrderId ? { ...o, status: 'return_requested' } : o));
      closeReturnModal({ force: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request return');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const canReturnOrder = (order) => {
    if (order.status !== 'delivered') return false;
    const deliveryDate = new Date(order.delivered_at || order.updated_at || order.created_at);
    const diffTime = Math.abs(new Date() - deliveryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
          <option value="">All Statuses</option>
          {['confirmed', 'processing', 'shipped', 'delivered', 'return_requested', 'cancelled', 'returned'].map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner size="lg" /> : orders.length === 0 ? (
        <EmptyState icon={HiOutlineClipboardList} title="No orders found" description="You haven't placed any orders yet." />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={getId(order)} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-slate-800">{order.order_number}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={order.status} />
                  {(order.status === 'processing' || order.status === 'confirmed') && (
                    <button onClick={() => handleCancel(getId(order))} className="text-xs text-rose-600 font-medium hover:underline">Cancel</button>
                  )}
                  {canReturnOrder(order) && (
                    <button onClick={() => openReturnModal(getId(order))} className="text-xs text-amber-600 font-medium hover:underline">Return</button>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.medicine_name} ×{item.quantity}</span>
                    <span className="text-slate-700 font-medium">{formatCurrency(item.total || item.subtotal)}</span>
                  </div>
                ))}
                {(order.items?.length || 0) > 3 && <p className="text-xs text-slate-400">+{order.items.length - 3} more items</p>}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 capitalize">{order.type} order</span>
                <span className="font-bold text-slate-800">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal
        isOpen={returnModalOpen}
        onClose={closeReturnModal}
        title="Return Order"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Please tell us why you want to return this order.
          </p>

          <div>
            <label htmlFor="return-reason" className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
            <textarea
              id="return-reason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Type your reason..."
              rows={4}
              disabled={returnSubmitting}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none disabled:opacity-60"
            />
            <p className="text-xs text-slate-400 mt-2">Reason is required.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeReturnModal}
              disabled={returnSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitReturn}
              disabled={returnSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {returnSubmitting ? 'Submitting...' : 'Submit Return'}
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}
