import { useState, useEffect } from 'react';
import { adminService } from '../services';
import { formatDate } from '../utils/formatters';
import { SearchBar, Badge, LoadingSpinner, Pagination } from '../components/ui';
import { useDebounce } from '../hooks';
import toast from 'react-hot-toast';

const getId = (item) => item?._id || item?.id;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 15 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (roleFilter) params.role = roleFilter;
    adminService.getUsers(params).then(res => {
      setUsers(res.data.data?.data || []);
      setTotalPages(res.data.data?.last_page || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    adminService.getPendingBusinesses().then(res => setPendingBusinesses(res.data.data || [])).catch(() => {});
  }, []);

  const handleApprove = async (businessId) => {
    try {
      await adminService.approveBusiness(businessId);
      setPendingBusinesses(prev => prev.filter(b => getId(b) !== businessId));
      toast.success('Business approved!');
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (businessId) => {
    const reason = window.prompt('Reject business application. Optional reason:', 'Application rejected.');
    if (reason === null) return;

    try {
      await adminService.rejectBusiness(businessId, reason);
      setPendingBusinesses(prev => prev.filter(b => getId(b) !== businessId));
      toast.success('Business rejected');
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await adminService.updateUser(userId, { is_active: !isActive });
      setUsers(prev => prev.map(u => getId(u) === userId ? { ...u, is_active: !isActive } : u));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">User Management</h1>

      {/* Pending Business Approvals */}
      {pendingBusinesses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-amber-800 mb-3">Pending Business Approvals ({pendingBusinesses.length})</h3>
          <div className="space-y-3">
            {pendingBusinesses.map(b => (
              <div key={getId(b)} className="flex items-center justify-between bg-white rounded-xl p-4 border border-amber-200">
                <div>
                  <p className="font-medium text-slate-800">{b.business_name}</p>
                  <p className="text-xs text-slate-500">GST: {b.gst_number} | License: {b.drug_license_number}</p>
                  <p className="text-xs text-slate-400">{b.user?.name} - {b.user?.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(getId(b))} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700">Approve</button>
                  <button onClick={() => handleReject(getId(b))} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="max-w-sm flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search users..." /></div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
          <option value="">All Roles</option>
          <option value="consumer">Consumer</option>
          <option value="store">Store</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500">User</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Role</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={getId(u)} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-4"><Badge status={u.role === 'admin' ? 'active' : u.role} /></td>
                    <td className="py-3 px-4"><Badge status={u.is_active ? 'active' : 'inactive'} /></td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleToggleActive(getId(u), u.is_active)}
                        className={`text-xs font-medium hover:underline ${u.is_active ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  );
}
