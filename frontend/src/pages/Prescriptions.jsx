import { useEffect, useState } from 'react';
import { HiOutlineDocumentText, HiOutlineUpload } from 'react-icons/hi';
import { prescriptionService } from '../services';
import { API_BASE_URL } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';
import { Badge, EmptyState, LoadingSpinner } from '../components/ui';
import toast from 'react-hot-toast';

const apiOrigin = API_BASE_URL.replace('/api', '');

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const { data } = await prescriptionService.getAll();
      setPrescriptions(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error('Choose a prescription file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await prescriptionService.upload(formData);
      setFile(null);
      event.target.reset();
      toast.success('Prescription uploaded for review');
      await fetchPrescriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
        <p className="text-slate-500 mt-1">Upload prescriptions for medicines that require verification.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Prescription file</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-primary-700"
            />
            <p className="text-xs text-slate-400 mt-1">Accepted: JPG, PNG, PDF up to 5 MB.</p>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            <HiOutlineUpload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner text="Loading prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <EmptyState icon={HiOutlineDocumentText} title="No prescriptions uploaded" description="Uploaded prescriptions will appear here with their review status." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">File</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Notes</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id || prescription._id} className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <a href={`${apiOrigin}${prescription.file_path}`} target="_blank" rel="noreferrer" className="font-medium text-primary-600 hover:underline">
                        {prescription.file_name || 'View file'}
                      </a>
                    </td>
                    <td className="py-3 px-4"><Badge status={prescription.status} /></td>
                    <td className="py-3 px-4 text-slate-600">{prescription.notes || '-'}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDateTime(prescription.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
