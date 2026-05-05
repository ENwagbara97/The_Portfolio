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
      <div className="min-h-screen flex items-center justify-center font-mono text-[var(--admin-text-muted)] bg-[var(--admin-bg)] uppercase tracking-widest text-[10px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
          <span>[ syncing_secure_node ]</span>
        </div>
      </div>
    );
  }

  // Already logged in — go straight to dashboard
  if (user) {
    return <Navigate to="/console" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError);
    } else {
      navigate('/console');
    }
    setSubmitting(false);
  };

  return (
    <div id="admin-root" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-[var(--admin-accent)]/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-[var(--admin-accent)]/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-[2.5rem] flex items-center justify-center bg-gradient-to-br from-accent-blue/10 to-accent-lime/10 border border-white/5 shadow-2xl backdrop-blur-xl">
            <Lock className="text-[var(--admin-accent)]" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-display text-[var(--admin-text)] tracking-tight">Admin Terminal</h1>
            <p className="text-[10px] mt-2 font-mono text-[var(--admin-text-muted)] uppercase tracking-[0.3em]">SECURE_ENTRY_NODE_V4</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="!p-10 !bg-[var(--admin-card)] !border-[var(--admin-border)] shadow-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-mono flex items-center gap-3">
                <AlertCircle size={16} />
                {error.toUpperCase()}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest mb-2 text-[var(--admin-text-muted)] px-1">
                    Credential_ID
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-2xl p-4 focus:outline-none transition-all bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]/20"
                    placeholder="admin@system.local"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest mb-2 text-[var(--admin-text-muted)] px-1">
                    Security_Key
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl p-4 focus:outline-none transition-all bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]/20"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full justify-center py-4 text-sm font-bold rounded-2xl transition-all flex items-center bg-[var(--admin-accent)] text-white hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    VALIDATING...
                  </>
                ) : (
                  'INITIALIZE_SESSION'
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-[var(--admin-text-muted)]">
                  New operator? {' '}
                  <Link to="/console/signup" className="text-[var(--admin-accent)] font-bold hover:underline">
                    Request Provisioning
                  </Link>
                </p>
              </div>
            </form>
          </GlassCard>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link to="/" className="text-[10px] font-mono uppercase tracking-[0.2em] transition-colors inline-flex items-center gap-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
            <ArrowLeft size={12} />
            Back to Public Terminal
          </Link>
        </motion.div>
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
