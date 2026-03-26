import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('admin@automation-hub.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      onLoginSuccess();
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      console.error('Login failed:', errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-cyan-600/8 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Gradient border container */}
        <div className="p-[1px] bg-gradient-to-r from-indigo-500/40 via-fuchsia-500/20 to-cyan-500/30 rounded-2xl">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Automation Hub</h1>
            <p className="text-slate-300 text-center mb-8">Personal Automation System</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="admin@example.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-slate-400 text-xs text-center mt-6">
              Default credentials: admin@automation-hub.local / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
