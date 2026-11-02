import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { member } = useAuth();
  return member?.role === "SUPER_ADMIN" ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" replace />
  );
}
