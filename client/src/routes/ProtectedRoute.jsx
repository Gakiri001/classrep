import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Feedback';

export default function ProtectedRoute() {
  const { member, loading } = useAuth();
  if (loading) return <Loader label="Restoring your session" full />;
  return member ? <Outlet /> : <Navigate to="/login" replace />;
}
