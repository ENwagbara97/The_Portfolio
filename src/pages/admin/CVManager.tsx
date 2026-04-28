import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/GlassCard';
import { FileText, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CVFile {
  id: string;
  file_name: string;
  file_url: string;
  is_active: boolean;
  uploaded_at: string;
}

export default function CVManager() {
  const { user, loading } = useAuth();
  const [cvs, setCVs] = useState<CVFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) loadCVs();
  }, [user]);

  async function loadCVs() {
    const { data } = await supabase.from('cv_uploads').select('*').order('uploaded_at', { ascending: false });
    if (data) setCVs(data as CVFile[]);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setMessage({ text: 'Only PDF files are allowed', type: 'error' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ text: 'File must be under 10MB', type: 'error' });
      return;
    }

    setUploading(true);
    const fileName = `cv-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage.from('cv-uploads').upload(fileName, file);

    if (uploadError) {
      setMessage({ text: 'Storage upload failed. Ensure bucket exists.', type: 'error' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('cv-uploads').getPublicUrl(fileName);

    // Deactivate others
    await supabase.from('cv_uploads').update({ is_active: false }).eq('is_active', true);
    
    // Insert new
    const { error: insertError } = await supabase.from('cv_uploads').insert({
      file_name: file.name,
      file_url: publicUrl,
      is_active: true,
    });

    if (insertError) {
      setMessage({ text: 'Failed to sync with database: ' + insertError.message, type: 'error' });
    } else {
      setMessage({ text: 'CV uploaded and activated successfully!', type: 'success' });
      loadCVs();
    }
    setUploading(false);
    setTimeout(() => setMessage(null), 5000);
  }

  async function deleteCVv(id: string, url: string) {
    if (!confirm('Are you sure you want to delete this CV?')) return;
    
    const fileName = url.split('/').pop();
    if (fileName) {
      await supabase.storage.from('cv-uploads').remove([fileName]);
    }
    await supabase.from('cv_uploads').delete().eq('id', id);
    loadCVs();
    setMessage({ text: 'CV deleted permanently.', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-muted">/ accessing_vault...</div>;
  if (!user) return <Navigate to="/" />;

  const activeCv = cvs.find(c => c.is_active);

  return (
    <div className="bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="mb-2">
          <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-mono text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--admin-accent)' }} />
            <h1 className="text-2xl font-display text-[var(--admin-text)]">CV & Resume Assets</h1>
          </div>
          <p className="text-sm text-[var(--admin-text-muted)]">Manage your professional documents and public availability.</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-mono flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
            {message.text}
          </div>
        )}

        {/* Active CV Hero View */}
        <section className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)]">Active_Asset</h3>
          <GlassCard className={`relative overflow-hidden group !bg-[var(--admin-card)] !border-[var(--admin-border)] ${!activeCv ? 'border-dashed border-2' : ''}`}>
            {activeCv ? (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center border" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 90%)', borderColor: 'color-mix(in srgb, var(--admin-accent), transparent 80%)' }}>
                  <FileText style={{ color: 'var(--admin-accent)' }} size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-heading font-bold text-[var(--admin-text)] text-lg">{activeCv.file_name}</h4>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-1">
                    <span className="text-xs text-[var(--admin-text-muted)] flex items-center gap-1">
                      Uploaded {new Date(activeCv.uploaded_at).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-mono border border-green-500/20">
                      LIVE_FOR_DOWNLOAD
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <a href={activeCv.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm text-center transition-all" style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                    Preview PDF
                  </a>
                  <button onClick={() => deleteCVv(activeCv.id, activeCv.file_url)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: 'var(--admin-border)' }}>
                  <FileText className="text-[var(--admin-text-muted)]" size={24} />
                </div>
                <div>
                  <p className="text-[var(--admin-text)] font-heading font-semibold">No active resume found</p>
                  <p className="text-sm text-[var(--admin-text-muted)]">Upload a PDF below to enable the Download CV button on your site.</p>
                </div>
              </div>
            )}
          </GlassCard>
        </section>

        {/* Upload Terminal */}
        <section className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)]">New_Upload</h3>
          <label className={`block cursor-pointer group`}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                uploading 
                  ? 'bg-[var(--admin-accent)]/5 animate-pulse cursor-wait' 
                  : 'hover:bg-[var(--admin-surface)]'
              }`}
              style={{ borderColor: uploading ? 'var(--admin-accent)' : 'var(--admin-border)' }}
            >
              <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
                <FileText className={uploading ? 'animate-bounce' : ''} style={{ color: 'var(--admin-accent)' }} size={32} />
              </div>
              <p className="text-[var(--admin-text)] font-heading font-semibold text-lg">
                {uploading ? 'Processing_Document...' : 'Upload New CV'}
              </p>
              <p className="text-[var(--admin-text-muted)] text-sm mt-2 max-w-xs mx-auto">
                Drag and drop your resume here, or click to browse. (Max 10MB, PDF only)
              </p>
            </div>
          </label>
        </section>

        {/* History Table */}
        {cvs.length > 1 && (
          <section className="space-y-4 pt-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)]">Version_History</h3>
            <GlassCard className="!p-0 overflow-hidden !bg-[var(--admin-card)] !border-[var(--admin-border)]">
              <div className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                {cvs.filter(c => !c.is_active).map(cv => (
                  <div key={cv.id} className="p-4 flex items-center justify-between hover:bg-[var(--admin-surface)] transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="text-[var(--admin-text-muted)]" size={18} />
                      <div>
                        <p className="text-sm font-heading font-medium text-[var(--admin-text)]">{cv.file_name}</p>
                        <p className="text-[10px] font-mono text-[var(--admin-text-muted)]">{new Date(cv.uploaded_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <a href={cv.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-secondary hover:text-primary transition-colors">
                        <FileText size={16} />
                      </a>
                      <button onClick={() => deleteCVv(cv.id, cv.file_url)} className="p-2 text-muted hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>
        )}

      </div>
    </div>
  );
}
