import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/GlassCard';
import { Trash2, Edit3, X, Plus, Loader2, ChevronUp, ChevronDown, Save, ArrowLeft, Wrench, Database, Globe, Map, Layers, Thermometer, Leaf, Droplets, Activity, Cpu, GitBranch, BarChart2, Satellite } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';

const ICONS = ['Database', 'Globe', 'Map', 'Layers', 'Thermometer', 'Leaf', 'Droplets', 'Activity', 'Cpu', 'GitBranch', 'BarChart2', 'Satellite'];
const CATEGORIES = ['Urban Planning', 'Environmental', 'Hydrography', 'Remote Sensing', 'Data Analysis'];

interface GISTool {
  id: string;
  title: string;
  description: string;
  tool_logic_url: string;
  icon_name: string;
  category: string;
  is_active: boolean;
  display_order: number;
}

const DynamicIcon = ({ name, size, className }: { name: string, size: number, className?: string }) => {
  const Icon = (LucideIcons as any)[name] || Database;
  return <Icon size={size} className={className} />;
};

export default function GISToolsManager() {
  const { user, loading: authLoading } = useAuth();
  const [tools, setTools] = useState<GISTool[]>([]);
  const [editing, setEditing] = useState<Partial<GISTool> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadTools();
  }, [user]);

  async function loadTools() {
    const { data } = await supabase.from('gis_tools').select('*').order('display_order', { ascending: true });
    if (data) setTools(data as GISTool[]);
  }

  async function handleSave() {
    if (!editing || !editing.title || !editing.description) return;
    setSaving(true);
    
    const payload = {
      title: editing.title,
      description: editing.description,
      tool_logic_url: editing.tool_logic_url || '#',
      icon_name: editing.icon_name || 'Database',
      category: editing.category || 'Urban Planning',
      is_active: editing.is_active ?? true,
      display_order: editing.display_order ?? tools.length
    };

    let error;
    if (editing.id) {
      const { error: err } = await supabase.from('gis_tools').update(payload).eq('id', editing.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('gis_tools').insert([payload]);
      error = err;
    }

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      setEditing(null);
      loadTools();
    }
    setSaving(false);
  }

  async function deleteTool(id: string) {
    if (confirm('Delete this GIS Tool? This will remove it from the public lab.')) {
      await supabase.from('gis_tools').delete().eq('id', id);
      loadTools();
    }
  }

  async function updateOrder(id: string, currentOrder: number, direction: 'up' | 'down') {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    await supabase.from('gis_tools').update({ display_order: newOrder }).eq('id', id);
    loadTools();
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    await supabase.from('gis_tools').update({ is_active: !currentStatus }).eq('id', id);
    loadTools();
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
            <h1 className="text-3xl font-display text-[var(--admin-text)]">GIS Toolbox</h1>
            <p className="text-[var(--admin-text-muted)] text-sm">Manage tools displayed in the public GIS Lab.</p>
          </div>
          <button 
            onClick={() => setEditing({ 
              title: '',
              description: '',
              tool_logic_url: '#',
              icon_name: 'Database',
              category: 'Urban Planning',
              is_active: true,
              display_order: tools.length 
            })} 
            className="flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold"
            style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}
          >
            <Plus size={18} />
            <span>New Tool</span>
          </button>
        </div>

        {/* List View */}
        <div className="space-y-4">
          {tools.map((t, i) => (
            <GlassCard key={t.id} className={`flex items-center gap-6 p-6 group !bg-[var(--admin-card)] !border-[var(--admin-border)] ${!t.is_active ? 'opacity-60' : ''}`}>
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => updateOrder(t.id, t.display_order, 'up')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors disabled:opacity-0" disabled={i === 0}>
                  <ChevronUp size={16} />
                </button>
                <span className="text-[10px] font-mono text-[var(--admin-text-muted)]">{t.display_order}</span>
                <button onClick={() => updateOrder(t.id, t.display_order, 'down')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors disabled:opacity-0" disabled={i === tools.length - 1}>
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 90%)', color: 'var(--admin-accent)', borderColor: 'color-mix(in srgb, var(--admin-accent), transparent 80%)' }}>
                <DynamicIcon name={t.icon_name} size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-[var(--admin-text)] truncate">{t.title}</h3>
                <p className="text-[10px] text-[var(--admin-text-muted)] font-mono mt-1 uppercase tracking-widest">{t.category}</p>
              </div>

              <div className="flex items-center gap-4">
                <button 
                    onClick={() => toggleActive(t.id, t.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${t.is_active ? 'bg-green-500/10 text-green-500' : 'bg-zinc-500/10 text-zinc-500'}`}
                >
                    {t.is_active ? 'Active' : 'Hidden'}
                </button>
                <button onClick={() => setEditing(t)} className="p-2 rounded-lg hover:bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => deleteTool(t.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--admin-text-muted)] hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </GlassCard>
          ))}
          {tools.length === 0 && (
             <div className="text-center py-20 border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--admin-border)' }}>
                <p className="text-[var(--admin-text-muted)] font-mono">No tools added.</p>
             </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-0 md:p-4">
          <div className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md bg-[var(--admin-bg)] border-none md:border md:border-[var(--admin-border)] rounded-none md:rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-surface), transparent 70%)' }}>
              <h2 className="text-xl font-display text-[var(--admin-text)]">{editing.id ? 'Edit Tool' : 'Add Tool'}</h2>
              <button onClick={() => setEditing(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Title</label>
                <input 
                  type="text" 
                  value={editing.title || ''} 
                  onChange={e => setEditing({...editing, title: e.target.value})}
                  className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all"
                  style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', textTransform: 'uppercase' }}
                  placeholder="e.g. HEAT ISLAND DETECTION"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Description</label>
                <textarea 
                  value={editing.description || ''} 
                  onChange={e => setEditing({...editing, description: e.target.value})}
                  className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all min-h-[100px]"
                  style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Tool Logic URL</label>
                <input 
                  type="text" 
                  value={editing.tool_logic_url || ''} 
                  onChange={e => setEditing({...editing, tool_logic_url: e.target.value})}
                  className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all"
                  style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                  placeholder="#"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Icon</label>
                  <select 
                    value={editing.icon_name || 'Database'} 
                    onChange={e => setEditing({...editing, icon_name: e.target.value})}
                    className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all appearance-none"
                    style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                  >
                    {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Category</label>
                  <select 
                    value={editing.category || 'Urban Planning'} 
                    onChange={e => setEditing({...editing, category: e.target.value})}
                    className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all appearance-none"
                    style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Active</label>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input 
                      type="checkbox" 
                      checked={editing.is_active ?? true} 
                      onChange={e => setEditing({...editing, is_active: e.target.checked})}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm">Visible to public</span>
                  </label>
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
            </div>

            <div className="p-6 pb-24 md:pb-6 border-t border-[var(--admin-border)] flex justify-end gap-3" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-surface), transparent 50%)' }}>
              <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-xl text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="min-w-[140px] flex items-center justify-center gap-2 px-6 py-2 rounded-xl transition-all font-bold" style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Tool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
