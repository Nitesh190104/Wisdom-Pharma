import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
  sendOtp: (email) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
};

export const medicineService = {
  getAll: (params) => api.get('/medicines', { params }),
  getFeatured: () => api.get('/medicines/featured'),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/admin/medicines', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  // Laravel doesn't support multipart PUT, so spoof it with POST + _method=PUT
  update: (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/admin/medicines/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/admin/medicines/${id}`, data);
  },
  delete: (id) => api.delete(`/admin/medicines/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return api.post('/admin/categories', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

export const cartService = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/add', data),
  updateItem: (data) => api.put('/cart/update', data),
  removeItem: (medicineId) => api.delete(`/cart/remove/${medicineId}`),
  clear: () => api.delete('/cart/clear'),
};

export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  place: (data) => api.post('/orders', data),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  'return': (id, reason) => api.post(`/orders/${id}/return`, { reason }),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getPendingBusinesses: () => api.get('/admin/businesses/pending'),
  approveBusiness: (id) => api.post(`/admin/businesses/${id}/approve`),
  rejectBusiness: (id, reason) => api.post(`/admin/businesses/${id}/reject`, { reason }),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  approveReturnRequest: (id) => api.post(`/admin/orders/${id}/return/approve`),
  rejectReturnRequest: (id, reason) => api.post(`/admin/orders/${id}/return/reject`, { reason }),
  getInventory: (params) => api.get('/admin/inventory', { params }),
  updateStock: (id, stock) => api.put(`/admin/inventory/${id}/stock`, { stock }),
  getPrescriptions: (params) => api.get('/admin/prescriptions', { params }),
  reviewPrescription: (id, data) => api.put(`/admin/prescriptions/${id}/review`, data),
};

export const prescriptionService = {
  getAll: () => api.get('/prescriptions'),
  upload: (formData) => api.post('/prescriptions', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const siteContentService = {
  get: (key) => api.get(`/site-content/${key}`),
  update: (key, data) => api.put(`/admin/site-content/${key}`, { data }),
};

export const contactService = {
  sendMessage: (data) => api.post('/contact', data),
};

