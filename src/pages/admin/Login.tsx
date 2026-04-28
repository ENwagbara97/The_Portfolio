import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminThemeProvider } from '../../context/AdminThemeContext';
import GlassCard from '../../components/GlassCard';
import { Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function LoginContent() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-[var(--admin-text-muted)] bg-[var(--admin-bg)]">
        / verifying_credentials...
      </div>
    );
  }

  // Already logged in — go straight to dashboard
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError);
    } else {
      navigate('/admin');
    }
    setSubmitting(false);
  };

  return (
    <div id="admin-root" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-[var(--admin-accent)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-[var(--admin-accent)]/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 90%)', border: '1px solid color-mix(in srgb, var(--admin-accent), transparent 80%)' }}>
            <Lock className="text-[var(--admin-accent)]" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-display text-[var(--admin-text)]">Admin Access</h1>
            <p className="text-sm mt-2 font-mono text-[var(--admin-text-muted)]">EBUBE_CHUKWU.sh // Control Plane</p>
          </div>
        </div>

        <GlassCard className="!p-8 !bg-[var(--admin-card)] !border-[var(--admin-border)]">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 text-[var(--admin-text-muted)]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full rounded-xl p-4 focus:outline-none transition-all bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text)]"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 text-[var(--admin-text-muted)]">
                Passphrase
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl p-4 focus:outline-none transition-all bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text)]"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full justify-center py-4 text-base font-bold rounded-xl transition-all flex items-center bg-[var(--admin-accent)] text-white hover:opacity-90"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Authenticating...
                </>
              ) : (
                'Initialize Session'
              )}
            </button>
          </form>
        </GlassCard>

        <div className="text-center">
          <Link to="/" className="text-xs font-mono transition-colors inline-flex items-center gap-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
            <ArrowLeft size={14} />
            Return to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <AdminThemeProvider>
      <LoginContent />
    </AdminThemeProvider>
  );
}
