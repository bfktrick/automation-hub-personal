import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginView } from './views/LoginView';
import { AutomationsView } from './views/AutomationsView';
import { DashboardView } from './views/DashboardView';
import { Toast, ToastMessage } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';

function App() {
  const auth = useAuth();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = () => {
    auth.logout();
    addToast('Logged out successfully', 'success');
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      <Routes>
        {/* Login route */}
        <Route
          path="/login"
          element={
            auth.isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginView onLoginSuccess={() => addToast('Login successful!', 'success')} />
            )
          }
        />

        {/* Protected routes with layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout onLogout={handleLogout} onAddToast={addToast} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardView onAddToast={addToast} />} />
          <Route path="automations" element={<AutomationsView onAddToast={addToast} />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
