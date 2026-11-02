import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ElectionProvider } from "./context/ElectionContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AppLayout from "./components/common/AppLayout";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import Participation from "./pages/Participation";
import Results from "./pages/Results";
import ElectionHistory from "./pages/ElectionHistory";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { Loader } from "./components/common/Feedback";

function HomeRedirect() {
  const { member, loading } = useAuth();
  if (loading) return <Loader label="Restoring your session" full />;
  return <Navigate to={member ? "/dashboard" : "/login"} replace />;
}

function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/participate" element={<Participation />} />
            <Route path="/results" element={<Results />} />
            <Route path="/election-history" element={<ElectionHistory />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function ElectionSession() {
  const { member } = useAuth();
  return (
    <ElectionProvider key={member?.id || "signed-out"}>
      <AppRoutes />
    </ElectionProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ElectionSession />
      </AuthProvider>
    </BrowserRouter>
  );
}
