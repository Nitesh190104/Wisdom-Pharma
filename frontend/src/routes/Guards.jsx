import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function RoleRoute({ children, roles }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, token } = useAuthStore();
  if (token && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'store') return <Navigate to="/store" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
