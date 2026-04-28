import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Project } from '../../lib/types';
import GlassCard from '../../components/GlassCard';
import Badge from '../../components/Badge';
import { Trash2, Edit3, X, Image, FileText, Globe, Plus, ChevronUp, ChevronDown, Check, Loader2, ArrowLeft } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';

export default function AdminProjects() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // track which field is uploading
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  async function loadProjects() {
    const { data } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
    if (data) setProjects(data as Project[]);
  }

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
  };

  async function uploadFile(file: File, bucket: string, folder: string) {
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: keyof Project) {
    if (!e.target.files?.length || !editing) return;
    const file = e.target.files[0];
    const bucket = field === 'cover_image_url' ? 'project-covers' : field === 'pdf_report_url' ? 'project-pdfs' : 'project-media';
    
    try {
      setUploading(String(field));
      const url = await uploadFile(file, bucket, editing.slug || 'temp');
      setEditing({ ...editing, [field]: url });
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Check if bucket exists.');
    } finally {
      setUploading(null);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length || !editing) return;
    const files = Array.from(e.target.files);
    const gallery = [...(editing.media_gallery || [])];
    
    try {
      setUploading('gallery');
      for (const file of files) {
        const url = await uploadFile(file, 'project-media', editing.slug || 'temp');
        gallery.push({ url, type: file.type.startsWith('video') ? 'video' : 'image', caption: '' });
      }
      setEditing({ ...editing, media_gallery: gallery });
    } catch (err) {
      console.error('Gallery upload failed:', err);
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    
    const payload = {
      ...editing,
      category_tags: editing.category_tags || [],
      media_gallery: editing.media_gallery || [],
      gis_metadata: editing.gis_metadata || {},
      // Keep as string or array depending on what's entered
      case_study_content: editing.case_study_content || [],
      case_study_html: (editing as any).case_study_html || ''
    };

    let error;
    if (editing.id) {
      const { error: err } = await supabase.from('projects').update(payload).eq('id', editing.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('projects').insert([payload]);
      error = err;
    }

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      setEditing(null);
      loadProjects();
    }
    setSaving(false);
  }

  async function deleteProject(id: string) {
    if (confirm('Delete this project permanently? This cannot be undone.')) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        alert('Delete failed: ' + error.message);
      } else {
        loadProjects();
      }
    }
  }

  async function updateOrder(id: string, currentOrder: number, direction: 'up' | 'down') {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    await supabase.from('projects').update({ display_order: newOrder }).eq('id', id);
    loadProjects();
  }

  async function toggleStatus(id: string, field: 'is_featured' | 'is_active', current: boolean) {
    await supabase.from('projects').update({ [field]: !current }).eq('id', id);
    loadProjects();
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-mono">/ reauthenticating...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="mb-2">
          <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-mono text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-display text-[var(--admin-text)]">Project Studio</h1>
            <p className="text-[var(--admin-text-muted)] text-sm">Create and curate your geospatial portfolio.</p>
          </div>
          <button 
            onClick={() => setEditing({ 
              title: '', 
              slug: '', 
              type: 'GIS', 
              category_tags: [], 
              is_featured: false, 
              is_active: true,
              display_order: projects.length 
            })} 
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>New Project</span>
          </button>
        </div>

        {/* Project List */}
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <GlassCard key={proj.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-4 md:p-5 group !bg-[var(--admin-card)] !border-[var(--admin-border)] relative cursor-pointer md:cursor-default" onClick={(e) => {
              if (window.innerWidth < 768) setEditing(proj);
            }}>
              <div className="flex md:flex-col items-center gap-3 md:gap-1 order-3 md:order-1 w-full md:w-auto border-t md:border-none pt-4 md:pt-0 mt-1 md:mt-0" onClick={e => e.stopPropagation()}>
                <button onClick={() => updateOrder(proj.id, proj.display_order, 'up')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors disabled:opacity-0" disabled={i === 0}>
                  <ChevronUp size={16} />
                </button>
                <span className="text-[10px] font-mono text-[var(--admin-text-muted)] px-2">{proj.display_order}</span>
                <button onClick={() => updateOrder(proj.id, proj.display_order, 'down')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors disabled:opacity-0" disabled={i === projects.length - 1}>
                  <ChevronDown size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-4 md:gap-6 w-full order-1 md:order-2">
                <div className="w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden bg-[var(--admin-input-bg)] border border-[var(--admin-border)] flex-shrink-0 flex items-center justify-center">
                  {proj.cover_image_url ? (
                    <img src={proj.cover_image_url} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]"><Image size={24} /></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-bold text-[var(--admin-text)] truncate max-w-[150px] md:max-w-none">{proj.title}</h3>
                    <span className={`text-[9px] md:text-[10px] px-2 py-0.5 rounded border border-[var(--admin-accent)]/20 uppercase font-mono ${
                      proj.type === 'GIS' ? 'text-accent-lime' : proj.type === 'UX' ? 'text-accent-blue' : 'text-purple-400'
                    }`}>
                      {proj.type}
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs text-[var(--admin-text-muted)] font-mono truncate">/projects/{proj.slug}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto order-2 md:order-3 md:ml-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-xs font-mono">
                  <button onClick={() => toggleStatus(proj.id, 'is_featured', proj.is_featured)} className={`flex items-center gap-1 transition-colors ${proj.is_featured ? 'text-accent-lime' : 'text-[var(--admin-text-muted)]'}`}>
                    <Check size={14} className={proj.is_featured ? 'opacity-100' : 'opacity-20'} />
                    <span className="hidden sm:inline">Featured</span>
                    <span className="sm:hidden">★</span>
                  </button>
                  <button onClick={() => toggleStatus(proj.id, 'is_active', proj.is_active)} className={`flex items-center gap-1 transition-colors ${proj.is_active ? 'text-accent-blue' : 'text-[var(--admin-text-muted)]'}`}>
                    <Check size={14} className={proj.is_active ? 'opacity-100' : 'opacity-20'} />
                    <span className="hidden sm:inline">Active</span>
                    <span className="sm:hidden">⚡</span>
                  </button>
                </div>
                
                <div className="flex gap-1">
                  <button onClick={() => setEditing(proj)} className="p-2.5 rounded-xl bg-[var(--admin-input-bg)] md:bg-transparent border border-[var(--admin-border)] md:border-none text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => deleteProject(proj.id)} className="p-2.5 rounded-xl bg-red-500/5 md:bg-transparent border border-red-500/10 md:border-none text-[var(--admin-text-muted)] hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Full Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
          <div className="w-full h-full md:max-w-5xl md:h-[90vh] bg-[var(--admin-bg)] border-none md:border md:border-[var(--admin-border)] rounded-none md:rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 md:zoom-in-100 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 90%)', color: 'var(--admin-accent)' }}>
                  {editing.id ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-display text-[var(--admin-text)]">{editing.id ? 'Edit Project Details' : 'Initialize New Project'}</h2>
                  <p className="text-xs text-[var(--admin-text-muted)] font-mono">PROJECT_ID: {editing.id || 'NEW_ENTRY'}</p>
                </div>
              </div>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-[var(--admin-surface)] rounded-full transition-colors text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                <X size={24} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 md:space-y-12">
              
              {/* SECTION: Basic Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-[var(--admin-border)] pb-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Title</label>
                    <input 
                      type="text" 
                      value={editing.title} 
                      onChange={e => {
                        const title = e.target.value;
                        const slug = editing.id ? editing.slug : generateSlug(title);
                        setEditing({...editing, title, slug});
                      }} 
                      className="w-full rounded-xl p-4 text-[var(--admin-text)] focus:outline-none transition-all" 
                      style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                      placeholder="e.g. Lagos Coastal Erosion Analysis"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Slug</label>
                    <input 
                      type="text" 
                      value={editing.slug} 
                      onChange={e => setEditing({...editing, slug: e.target.value})} 
                      className="w-full rounded-xl p-4 text-[var(--admin-text-muted)] font-mono text-sm focus:outline-none transition-all" 
                      style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-3">Project Classification</label>
                      <div className="flex flex-wrap gap-2">
                        {['GIS', 'UX', 'Hybrid'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEditing({...editing, type: t as any})}
                            className={`px-4 py-2.5 rounded-xl font-heading font-semibold text-[10px] uppercase tracking-widest transition-all flex-1 min-w-[80px] ${
                              editing.type === t 
                                ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'
                            }`}
                          >
                            {t === 'UX' ? 'UX Design' : t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-3">Project Date</label>
                      <input 
                        type="date" 
                        value={editing.project_date || ''} 
                        onChange={e => setEditing({...editing, project_date: e.target.value})} 
                        className="w-full rounded-xl p-3 text-sm focus:outline-none transition-all" 
                        style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Client / Institution</label>
                    <input 
                      type="text" 
                      value={editing.client_name || ''} 
                      onChange={e => setEditing({...editing, client_name: e.target.value})}
                      className="w-full rounded-xl p-4 text-[var(--admin-text)] focus:outline-none transition-all" 
                      style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                      placeholder="e.g. Shell Nigeria"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editing.category_tags?.map(tag => (
                        <button 
                          key={tag} 
                          onClick={() => setEditing({...editing, category_tags: editing.category_tags?.filter(t => t !== tag)})}
                          className="hover:scale-105 transition-transform"
                        >
                          <Badge label={tag} className="border border-[color-mix(in srgb, var(--admin-accent), transparent 80%)]" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 90%)', color: 'var(--admin-accent)' }} />
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input 
                        type="text"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newTag) {
                            e.preventDefault();
                            setEditing({...editing, category_tags: [...(editing.category_tags || []), newTag]});
                            setNewTag('');
                          }
                        }}
                        className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all pr-12"
                        style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                        placeholder="Add tag and press Enter..."
                      />
                      <button 
                        onClick={() => { if(newTag) { setEditing({...editing, category_tags: [...(editing.category_tags || []), newTag]}); setNewTag(''); } }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--admin-accent)]"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Media & Assets */}
              <div className="space-y-8 border-b border-[var(--admin-border)] pb-12">
                <h3 className="text-xl font-display text-[var(--admin-text)]">Media & Visual Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Cover Image */}
                  <div className="space-y-4">
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted">Primary_Cover</label>
                    <div className="aspect-video rounded-2xl border border-[var(--admin-border)] overflow-hidden relative group" style={{ backgroundColor: 'var(--admin-input-bg)' }}>
                      {editing.cover_image_url ? (
                        <>
                          <img src={editing.cover_image_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button onClick={() => setEditing({...editing, cover_image_url: null})} className="p-3 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"><Trash2 size={20}/></button>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-accent-blue/5 transition-colors" style={{ color: 'var(--admin-text-muted)' }}>
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'cover_image_url')} />
                          {uploading === 'cover_image_url' ? <Loader2 className="animate-spin text-accent-blue" /> : <Image className="mb-2" size={32} style={{ color: 'var(--admin-text-muted)' }} />}
                          <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>Upload Cover</span>
                        </label>
                      )}
                    </div>
                  </div>

                   {/* PDF Report */}
                   <div className="space-y-4">
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted">Technical_Report</label>
                    <div className="h-[120px] rounded-2xl border flex items-center justify-center relative" style={{ backgroundColor: 'var(--admin-input-bg)', borderColor: 'var(--admin-border)' }}>
                      {editing.pdf_report_url ? (
                        <div className="text-center group">
                          <FileText className="text-accent-blue mx-auto mb-2" size={32} />
                          <p className="text-[10px] text-muted truncate max-w-[150px]">REPORT_ATTACHED.pdf</p>
                          <button onClick={() => setEditing({...editing, pdf_report_url: null})} className="absolute top-2 right-2 text-muted hover:text-red-400"><Trash2 size={16}/></button>
                        </div>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-accent-blue/5 transition-colors" style={{ color: 'var(--admin-text-muted)' }}>
                          <input type="file" accept=".pdf" className="hidden" onChange={e => handleFileUpload(e, 'pdf_report_url')} />
                          {uploading === 'pdf_report_url' ? <Loader2 className="animate-spin text-accent-blue" /> : <FileText className="mb-2" size={32} style={{ color: 'var(--admin-text-muted)' }} />}
                          <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>Upload PDF</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* GeoJSON */}
                  <div className="space-y-4">
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted">Spatial_Dataset</label>
                    <div className="h-[120px] rounded-2xl border flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--admin-input-bg)', borderColor: 'var(--admin-border)' }}>
                      <Globe className="text-accent-lime mb-2" size={32} />
                      <input 
                        type="text" 
                        value={editing.geojson_url || ''} 
                        onChange={e => setEditing({...editing, geojson_url: e.target.value})}
                        className="w-full border-none text-[10px] text-center font-mono focus:outline-none" 
                        style={{ background: 'transparent', color: 'var(--admin-text-muted)' }}
                        placeholder="Paste GeoJSON URL..."
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <div className="space-y-4">
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted text-center">Project_Media_Gallery</label>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {editing.media_gallery?.map((item, idx) => (
                      <div key={idx} className="aspect-square rounded-xl bg-surface border border-border-default overflow-hidden relative group">
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setEditing({...editing, media_gallery: editing.media_gallery?.filter((_, i) => i !== idx)})}
                          className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
                      <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleGalleryUpload} />
                      {uploading === 'gallery' ? <Loader2 className="animate-spin text-accent-blue" /> : <Plus className="text-muted" />}
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION: Descriptions & Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-[var(--admin-border)] pb-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-display text-[var(--admin-text)]">Context & Narrative</h3>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Short Abstract</label>
                    <textarea 
                      value={editing.short_description || ''} 
                      onChange={e => setEditing({...editing, short_description: e.target.value})}
                      className="w-full rounded-xl p-4 text-sm h-32 focus:outline-none" 
                      style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                      placeholder="Brief summary for project cards..."
                    />
                  </div>
                  <div className="col-span-full w-full">
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-4 text-center border-b border-[var(--admin-border)] pb-2">Narrative Case Study Construction</label>
                    <div className="w-full">
                      <RichTextEditor 
                        content={editing.case_study_content}
                        onChange={(json, html) => setEditing({...editing, case_study_content: json, case_study_html: html})}
                        slug={editing.slug}
                      />
                    </div>
                  </div>
                </div>
                {/* SECTION: GIS Metadata (Conditional) */}
                {editing.type !== 'UX' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-2">
                      <h3 className="text-xl font-display text-[var(--admin-text)]">GIS Metadata</h3>
                      {editing.type === 'Hybrid' && (
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-[var(--admin-text-muted)] uppercase tracking-widest">
                            {editing.gis_metadata?.enabled ? 'Metadata Active' : 'Metadata Inactive'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditing({
                              ...editing,
                              gis_metadata: { ...(editing.gis_metadata || {}), enabled: !editing.gis_metadata?.enabled }
                            })}
                            className={`w-12 h-6 rounded-full transition-all relative ${
                              editing.gis_metadata?.enabled ? 'bg-[var(--admin-accent)]' : 'bg-[var(--admin-input-bg)] border border-[var(--admin-border)]'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all ${
                              editing.gis_metadata?.enabled ? 'translate-x-6 bg-white' : 'translate-x-0 bg-[var(--admin-text-muted)]'
                            }`} />
                          </button>
                        </div>
                      )}
                    </div>

                    {(editing.type === 'GIS' || (editing.type === 'Hybrid' && editing.gis_metadata?.enabled)) ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">Coordinate System</label>
                          <input 
                            type="text" 
                            value={editing.gis_metadata?.coordinate_system || ''} 
                            onChange={e => setEditing({...editing, gis_metadata: {...(editing.gis_metadata || {}), coordinate_system: e.target.value}})}
                            className="w-full rounded-xl px-4 py-2 text-sm font-mono focus:outline-none transition-all" 
                            style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                            placeholder="e.g. WGS 1984"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">Data Points</label>
                          <input 
                            type="number" 
                            value={editing.gis_metadata?.data_points || 0} 
                            onChange={e => setEditing({...editing, gis_metadata: {...(editing.gis_metadata || {}), data_points: parseInt(e.target.value)}})}
                            className="w-full rounded-xl px-4 py-2 text-sm font-mono focus:outline-none transition-all" 
                            style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-input-bg)]/30 flex flex-col items-center justify-center text-center">
                        <Globe className="text-[var(--admin-text-muted)] opacity-20 mb-3" size={40} />
                        <p className="text-xs text-[var(--admin-text-muted)] font-mono uppercase tracking-widest">GIS Metadata is currently disabled for this Hybrid project.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[var(--admin-border)] flex justify-between items-center" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-surface), transparent 50%)' }}>
              <div className="flex gap-4">
                 <label className="flex items-center gap-2 text-sm text-[var(--admin-text)] cursor-pointer font-mono">
                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--admin-border)]" checked={editing.is_featured || false} onChange={e => setEditing({...editing, is_featured: e.target.checked})} />
                    IS_FEATURED
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--admin-text)] cursor-pointer font-mono">
                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--admin-border)]" checked={editing.is_active !== false} onChange={e => setEditing({...editing, is_active: e.target.checked})} />
                    SYSTEM_ACTIVE
                  </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-xl text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="min-w-[160px] flex items-center justify-center gap-2 px-6 py-2 rounded-xl transition-all" style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editing.id ? 'Save Changes' : 'Publish Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
