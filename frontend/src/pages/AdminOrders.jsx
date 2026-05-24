import { useState, useEffect } from 'react';
import { adminService } from '../services';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge, LoadingSpinner, Pagination, Modal } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const getId = (item) => item?._id || item?.id;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Selected order details state
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [returnActionLoading, setReturnActionLoading] = useState(false);

  const statusOptions = ['confirmed', 'processing', 'shipped', 'delivered', 'return_requested', 'cancelled', 'returned'];

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 15 };
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;
    adminService.getAllOrders(params).then(res => {
      setOrders(res.data.data?.data || []);
      setTotalPages(res.data.data?.last_page || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, statusFilter, typeFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => getId(o) === orderId ? { ...o, status: newStatus } : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed to update'); }
  };

  const approveReturn = async (orderId) => {
    setReturnActionLoading(true);
    try {
      await adminService.approveReturnRequest(orderId);
      setOrders(prev => prev.map(o => getId(o) === orderId ? { ...o, status: 'returned' } : o));
      setSelectedOrder(prev => prev && getId(prev) === orderId ? { ...prev, status: 'returned' } : prev);
      toast.success('Return approved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve return');
    } finally {
      setReturnActionLoading(false);
    }
  };

  const openRejectModal = () => {
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (returnActionLoading) return;
    setRejectModalOpen(false);
    setRejectReason('');
  };

  const rejectReturn = async (orderId) => {
    setReturnActionLoading(true);
    try {
      await adminService.rejectReturnRequest(orderId, rejectReason.trim() || undefined);
      setOrders(prev => prev.map(o => getId(o) === orderId ? { ...o, status: 'delivered' } : o));
      setSelectedOrder(prev => prev && getId(prev) === orderId ? { ...prev, status: 'delivered' } : prev);
      toast.success('Return rejected');
      closeRejectModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject return');
    } finally {
      setReturnActionLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Order Management</h1>

      <div className="flex gap-4 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
          <option value="">All Types</option>
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Order #</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Total</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Update</th>
              </tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={getId(order)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary-600 hover:text-primary-700 hover:underline font-semibold font-mono text-left focus:outline-none"
                      >
                        {order.order_number}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{order.user?.name || 'N/A'}</td>
                    <td className="py-3 px-4 capitalize text-slate-600">{order.type}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-4"><Badge status={order.status} /></td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4">
                      <select value={order.status} onChange={(e) => handleStatusChange(getId(order), e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none bg-white">
                        {statusOptions.map(s => (
                          <option key={s} value={s} className="capitalize" disabled={s === 'return_requested'}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}

      {/* Selected Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 font-mono">Order Details: {selectedOrder.order_number}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Placed on {formatDate(selectedOrder.created_at)}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-6">
                
                {/* Left Side: Delivery & Customer details */}
                <div className="space-y-6">
                  {/* Delivery Address Card */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Delivery Information</h4>
                    {selectedOrder.shipping_address ? (
                      <div className="space-y-1.5 text-sm text-slate-700">
                        <p className="font-bold text-slate-800 text-base">{selectedOrder.shipping_address.name}</p>
                        <p>{selectedOrder.shipping_address.address}</p>
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}</p>
                        <p className="pt-2 font-semibold text-slate-800">Phone: {selectedOrder.shipping_address.phone}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No delivery address provided.</p>
                    )}
                  </div>

                  {/* Customer & Status Card */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Customer & Billing</h4>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p><strong>Customer Name:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                      <p><strong>Email Address:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                      <p><strong>Portal Order Type:</strong> <span className="capitalize font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded text-xs">{selectedOrder.type}</span></p>
                      <p><strong>Payment Method:</strong> <span className="uppercase text-xs font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">{selectedOrder.payment_method}</span></p>
                      <p><strong>Payment Status:</strong> <span className={`capitalize text-xs font-bold px-2 py-0.5 rounded ${
                        selectedOrder.payment_status === 'paid' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                      }`}>{selectedOrder.payment_status}</span></p>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {selectedOrder.notes && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Notes</h4>
                      <p className="text-sm text-slate-600 italic">"{selectedOrder.notes}"</p>
                    </div>
                  )}

                  {/* Return Request */}
                  {selectedOrder.status === 'return_requested' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Return Requested</h4>
                      <p className="text-sm text-slate-700">
                        <strong>Reason:</strong> {selectedOrder.return_reason || 'N/A'}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => approveReturn(getId(selectedOrder))}
                          disabled={returnActionLoading}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {returnActionLoading ? 'Please wait...' : 'Approve'}
                        </button>
                        <button
                          onClick={openRejectModal}
                          disabled={returnActionLoading}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Ordered Products */}
                <div className="flex flex-col h-full bg-slate-50 border border-slate-200/80 rounded-2xl p-5 overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 shrink-0">Ordered Items</h4>
                  
                  {/* Table Wrapper */}
                  <div className="flex-1 overflow-y-auto min-h-[150px] mb-4 border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Medicine</th>
                          <th className="text-center py-2.5 px-3 font-semibold text-slate-600 w-12">Qty</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-slate-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item) => (
                          <tr key={item.medicine_id || item.medicine_name} className="border-b border-slate-100 last:border-none">
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-slate-800">{item.medicine_name}</p>
                              <p className="text-[10px] text-slate-400">₹{item.unit_price} each</p>
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                              {formatCurrency(item.total || (item.unit_price * item.quantity))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shrink-0">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal (excl. GST):</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>GST Tax Total:</span>
                      <span>{formatCurrency(selectedOrder.gst_total)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                        <span>Discount:</span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-100">
                      <span>Grand Total:</span>
                      <span className="text-primary-700">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Controls */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <label htmlFor="admin-order-status" className="text-xs font-bold text-slate-500 uppercase">Change Status:</label>
                  <select 
                    id="admin-order-status"
                    value={selectedOrder.status} 
                    onChange={(e) => {
                      handleStatusChange(getId(selectedOrder), e.target.value);
                      setSelectedOrder(prev => ({ ...prev, status: e.target.value }));
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white"
                  >
                      {statusOptions.map(s => (
                        <option key={s} value={s} className="capitalize" disabled={s === 'return_requested'}>
                          {s}
                        </option>
                      ))}
                  </select>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm transition-all shadow-md"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

        <Modal isOpen={rejectModalOpen} onClose={closeRejectModal} title="Reject Return Request">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Optional: provide a reason to share with the customer.</p>
            <div>
              <label htmlFor="reject-reason" className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={4}
                disabled={returnActionLoading}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none disabled:opacity-60"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={returnActionLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => selectedOrder && rejectReturn(getId(selectedOrder))}
                disabled={returnActionLoading || !selectedOrder}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {returnActionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </Modal>
    </div>
  );
}
