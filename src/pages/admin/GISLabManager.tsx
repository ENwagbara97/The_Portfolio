import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/GlassCard';
import { Trash2, Edit3, X, Plus, Loader2, ChevronUp, ChevronDown, Save, Folder, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GISFolder {
  id: string;
  folder_name: string;
  display_order: number;
}

export default function GISLabManager() {
  const { user, loading: authLoading } = useAuth();
  const [folders, setFolders] = useState<GISFolder[]>([]);
  const [editing, setEditing] = useState<Partial<GISFolder> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadFolders();
  }, [user]);

  async function loadFolders() {
    const { data } = await supabase.from('gis_folders').select('*').order('display_order', { ascending: true });
    if (data) setFolders(data as GISFolder[]);
  }

  async function handleSave() {
    if (!editing || !editing.folder_name) return;
    setSaving(true);
    
    const payload = {
      folder_name: editing.folder_name,
      display_order: editing.display_order ?? folders.length
    };

    let error;
    if (editing.id) {
      const { error: err } = await supabase.from('gis_folders').update(payload).eq('id', editing.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('gis_folders').insert([payload]);
      error = err;
    }

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      setEditing(null);
      loadFolders();
    }
    setSaving(false);
  }

  async function deleteFolder(id: string) {
    if (confirm('Delete this GIS folder? This may affect the public lab display.')) {
      await supabase.from('gis_folders').delete().eq('id', id);
      loadFolders();
    }
  }

  async function updateOrder(id: string, currentOrder: number, direction: 'up' | 'down') {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    await supabase.from('gis_folders').update({ display_order: newOrder }).eq('id', id);
    loadFolders();
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-mono text-muted">/ syncing_geodata...</div>;
  if (!user) return <Navigate to="/console/login" />;

  return (
    <div className="bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-2">
          <Link to="/console" className="inline-flex items-center gap-2 text-xs font-mono text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors bg-[var(--admin-card)] px-4 py-2 rounded-full border border-[var(--admin-border)] md:bg-transparent md:border-none md:p-0">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-display text-[var(--admin-text)]">GIS Lab Management</h1>
            <p className="text-[var(--admin-text-muted)] text-sm">Organize spatial categories and command center nodes.</p>
          </div>
          <button 
            onClick={() => setEditing({ 
              folder_name: '', 
              display_order: folders.length 
            })} 
            className="flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold"
            style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}
          >
            <Plus size={18} />
            <span>New Node</span>
          </button>
        </div>

        {/* List View */}
        <div className="space-y-4">
          {folders.map((f, i) => (
            <GlassCard key={f.id} className="flex items-center gap-6 p-6 group !bg-[var(--admin-card)] !border-[var(--admin-border)]">
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => updateOrder(f.id, f.display_order, 'up')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors disabled:opacity-0" disabled={i === 0}>
                  <ChevronUp size={16} />
                </button>
                <span className="text-[10px] font-mono text-[var(--admin-text-muted)]">{f.display_order}</span>
                <button onClick={() => updateOrder(f.id, f.display_order, 'down')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors disabled:opacity-0" disabled={i === folders.length - 1}>
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 90%)', color: 'var(--admin-accent)', borderColor: 'color-mix(in srgb, var(--admin-accent), transparent 80%)' }}>
                <Folder size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-[var(--admin-text)] truncate">{f.folder_name}</h3>
                <p className="text-[10px] text-[var(--admin-text-muted)] font-mono mt-1 uppercase tracking-widest">Type: Spatial_Data_Node</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(f)} className="p-2 rounded-lg hover:bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => deleteFolder(f.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--admin-text-muted)] hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </GlassCard>
          ))}
          {folders.length === 0 && (
             <div className="text-center py-20 border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--admin-border)' }}>
                <p className="text-[var(--admin-text-muted)] font-mono">No nodes initialized.</p>
             </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-surface), transparent 70%)' }}>
              <h2 className="text-xl font-display text-[var(--admin-text)]">{editing.id ? 'Edit Node' : 'Initialize Node'}</h2>
              <button onClick={() => setEditing(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Node Name</label>
                <input 
                  type="text" 
                  value={editing.folder_name || ''} 
                  onChange={e => setEditing({...editing, folder_name: e.target.value})}
                  className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all"
                  style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                  placeholder="e.g. Environmental Surveys"
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Sequence Order</label>
                <input 
                  type="number" 
                  value={editing.display_order ?? 0} 
                  onChange={e => setEditing({...editing, display_order: parseInt(e.target.value)})}
                  className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all"
                  style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--admin-border)] flex justify-end gap-3" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-surface), transparent 50%)' }}>
              <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-xl text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="min-w-[140px] flex items-center justify-center gap-2 px-6 py-2 rounded-xl transition-all font-bold" style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Confirm Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
