import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AuthenticatedLayoutProps {
  onLogout: () => void;
  onAddToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function AuthenticatedLayout({ onLogout, onAddToast }: AuthenticatedLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Automation Hub</h1>
              <p className="text-slate-400 text-sm">Welcome, {user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/automations"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`
              }
            >
              Automations
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main content - renders nested routes via <Outlet> */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ onAddToast }} />
      </main>
    </div>
  );
}
