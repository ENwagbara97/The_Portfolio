import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ClientEnquiry } from '../../lib/types';
import GlassCard from '../../components/GlassCard';
import { Mail, CheckCircle, Trash2, Calendar, User, MessageCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminEnquiries() {
  const { user, loading: authLoading } = useAuth();
  const [enquiries, setEnquiries] = useState<ClientEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEnquiries() {
    setLoading(true);
    const { data } = await supabase.from('client_enquiries').select('*').order('created_at', { ascending: false });
    if (data) setEnquiries(data);
    setLoading(false);
  }

  useEffect(() => {
    if (user) {
      loadEnquiries();

      const subscription = supabase
        .channel('enquiries_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'client_enquiries' }, () => {
          loadEnquiries();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

  async function markAsRead(id: string) {
    await supabase.from('client_enquiries').update({ read_by_admin: true }).eq('id', id);
    loadEnquiries();
  }

  async function deleteEnquiry(id: string) {
    if (confirm('Delete this inquiry?')) {
      const { error } = await supabase.from('client_enquiries').delete().eq('id', id);
      if (error) {
        alert('Delete failed: ' + error.message);
      } else {
        loadEnquiries();
      }
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-mono">/ retrieving_enquiries...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[var(--admin-text)]">
      <div className="mb-2">
        <Link to="/console" className="inline-flex items-center gap-2 text-xs font-mono text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors bg-[var(--admin-card)] px-4 py-2 rounded-full border border-[var(--admin-border)] md:bg-transparent md:border-none md:p-0">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-display text-[var(--admin-text)]">Client Enquiries</h1>
          <p className="text-[var(--admin-text-muted)] text-sm">Review incoming project requests and collaboration outreach.</p>
        </div>
        <div className="text-right">
            <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border" style={{ backgroundColor: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)' }}>
                Total Logs: {enquiries.length}
            </span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 size={48} className="animate-spin opacity-50" style={{ color: 'var(--admin-accent)' }} />
            <p className="text-sm font-mono tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>FETCHING_INCOMING_DATA...</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--admin-border)' }}>
          <MessageCircle size={40} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--admin-text-muted)' }} />
          <p style={{ color: 'var(--admin-text-muted)' }}>No inquiries found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <GlassCard key={enq.id} className={`group border-l-4 transition-all !bg-[var(--admin-card)] !border-[var(--admin-border)] ${enq.read_by_admin ? 'border-l-transparent' : 'border-l-[var(--admin-accent)]'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-accent)' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-[var(--admin-text)] flex items-center gap-2">
                        {enq.full_name}
                        {!enq.read_by_admin && <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--admin-accent)' }} />}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-[var(--admin-text-muted)]">
                        <span className="flex items-center gap-1"><Mail size={12}/> {enq.email}</span>
                        <span className="flex items-center gap-1 font-mono uppercase px-1.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 90%)', color: 'var(--admin-accent)' }}>{enq.service_interest || 'General'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl border leading-relaxed text-sm text-[var(--admin-text-muted)]" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-bg), white 2%)', borderColor: 'var(--admin-border)' }}>
                    {enq.project_description}
                  </div>

                  {enq.budget_range && (
                    <div className="flex items-center gap-2 text-xs font-mono text-accent-lime">
                        <AlertCircle size={14} />
                        Estimated Budget: {enq.budget_range}
                    </div>
                  )}
                </div>

                  <div className="flex flex-row md:flex-col justify-between md:items-end gap-3 min-w-[120px] pt-4 md:pt-0 border-t md:border-none">
                    <div className="text-left md:text-right space-y-1">
                      <p className="text-[10px] font-mono text-[var(--admin-text-muted)] uppercase flex items-center md:justify-end gap-1">
                        <Calendar size={10} />
                        {new Date(enq.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-mono text-[var(--admin-text-muted)] uppercase">{new Date(enq.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {!enq.read_by_admin && (
                          <button 
                              onClick={() => markAsRead(enq.id)}
                              className="p-2.5 rounded-xl transition-all shadow-sm bg-[var(--admin-input-bg)] md:bg-transparent border border-[var(--admin-border)] md:border-none"
                              style={{ color: 'var(--admin-accent)' }}
                              title="Mark as Read"
                          >
                              <CheckCircle size={18} />
                          </button>
                      )}
                      <button 
                          onClick={() => deleteEnquiry(enq.id)}
                          className="p-2.5 rounded-xl bg-red-500/5 md:bg-transparent border border-red-500/10 md:border-none text-red-400 transition-all shadow-sm"
                          title="Delete Permanently"
                      >
                          <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
