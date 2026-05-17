import { useEffect, useState } from 'react';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { adminService } from '../services';
import { API_BASE_URL } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';
import { Badge, EmptyState, LoadingSpinner, Pagination } from '../components/ui';
import toast from 'react-hot-toast';

const apiOrigin = API_BASE_URL.replace('/api', '');

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState({});

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (status) params.status = status;

    adminService.getPrescriptions(params)
      .then(({ data }) => {
        setPrescriptions(data.data?.data || []);
        setTotalPages(data.data?.last_page || 1);
      })
      .catch(error => toast.error(error.response?.data?.message || 'Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, [page, status]);

  const handleReview = async (prescription, nextStatus) => {
    const id = prescription.id || prescription._id;
    try {
      await adminService.reviewPrescription(id, {
        status: nextStatus,
        notes: notes[id] || '',
      });
      toast.success(`Prescription ${nextStatus}`);
      setPrescriptions(prev => prev.map(item => (item.id || item._id) === id
        ? { ...item, status: nextStatus, notes: notes[id] || item.notes }
        : item));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review prescription');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescription Verification</h1>
          <p className="text-slate-500 mt-1">Review uploaded prescriptions before order fulfillment.</p>
        </div>
        <select
          value={status}
          onChange={(event) => { setStatus(event.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <EmptyState icon={HiOutlineDocumentText} title="No prescriptions found" description="Prescription uploads will appear here for review." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">File</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Notes</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Uploaded</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => {
                  const id = prescription.id || prescription._id;
                  return (
                    <tr key={id} className="border-b border-slate-100 align-top">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{prescription.user?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{prescription.user?.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <a href={`${apiOrigin}${prescription.file_path}`} target="_blank" rel="noreferrer" className="font-medium text-primary-600 hover:underline">
                          {prescription.file_name || 'View file'}
                        </a>
                      </td>
                      <td className="py-3 px-4"><Badge status={prescription.status} /></td>
                      <td className="py-3 px-4 min-w-56">
                        <textarea
                          value={notes[id] ?? prescription.notes ?? ''}
                          onChange={(event) => setNotes(prev => ({ ...prev, [id]: event.target.value }))}
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="Review notes"
                        />
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDateTime(prescription.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleReview(prescription, 'approved')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">Approve</button>
                          <button onClick={() => handleReview(prescription, 'rejected')} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700">Reject</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  );
}
