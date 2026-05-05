import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AdminThemeProvider } from '../../context/AdminThemeContext';
import GlassCard from '../../components/GlassCard';
import { UserPlus, Loader2, AlertCircle, ArrowLeft, ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

function SignupContent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passphrases do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Passphrase must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/console/login`
        }
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/console/login'), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="admin-root" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors duration-300">
      {/* Dynamic Background Elements - matched to Login.tsx for consistency */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-[var(--admin-accent)]/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-[var(--admin-accent)]/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-[2.5rem] flex items-center justify-center bg-gradient-to-br from-[var(--admin-accent)]/10 to-[var(--admin-accent)]/5 border border-[var(--admin-border)] shadow-2xl backdrop-blur-xl">
            <UserPlus className="text-[var(--admin-accent)]" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-display text-[var(--admin-text)] tracking-tight">Admin Terminal</h1>
            <p className="text-[10px] mt-2 font-mono text-[var(--admin-text-muted)] uppercase tracking-[0.3em]">PROVISION_NEW_NODE</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="!p-10 !bg-[var(--admin-card)] !border-[var(--admin-border)] shadow-2xl relative overflow-hidden">
            {/* Success State */}
            {success ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
                  <ShieldCheck size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[var(--admin-text)]">Clearance Granted</h3>
                  <p className="text-xs text-[var(--admin-text-muted)] leading-relaxed font-mono">
                    Identity registered. Check your inbox. <br/><br/>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--admin-accent)] animate-pulse">Redirecting to bridge...</span>
                  </p>
                </div>
                <div className="h-1 w-full bg-[var(--admin-border)] rounded-full overflow-hidden mt-8">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-green-500"
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-mono flex items-center gap-3"
                  >
                    <AlertCircle size={16} />
                    {error.toUpperCase()}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest mb-2 text-[var(--admin-text-muted)] px-1">
                      Credential_ID (Email)
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
                      Security_Key (Passphrase)
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

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest mb-2 text-[var(--admin-text-muted)] px-1">
                      Verify_Security_Key
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl p-4 focus:outline-none transition-all bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]/20"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full justify-center py-4 text-sm font-bold rounded-2xl transition-all flex items-center bg-[var(--admin-accent)] text-white hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] active:scale-[0.98] disabled:opacity-50 mt-8"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      PROVISIONING...
                    </>
                  ) : (
                    'INITIALIZE_ACCOUNT'
                  )}
                </button>

                <div className="text-center pt-4">
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    Already authenticated? {' '}
                    <Link to="/console/login" className="text-[var(--admin-accent)] font-bold hover:underline">
                      Return to Bridge
                    </Link>
                  </p>
                </div>
              </form>
            )}
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

export default function AdminSignup() {
  return (
    <AdminThemeProvider>
      <SignupContent />
    </AdminThemeProvider>
  );
}
