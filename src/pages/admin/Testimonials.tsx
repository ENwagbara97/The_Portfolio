import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase, Testimonial } from '../../lib/supabase';
import GlassCard from '../../components/GlassCard';
import { Reorder } from 'framer-motion';
import { GripVertical, Trash2, Edit3, X, User, Star, Plus, Loader2, ChevronUp, ChevronDown, UserCircle, Pencil } from 'lucide-react';

export default function AdminTestimonials() {
  const { user, loading: authLoading } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) loadTestimonials();
  }, [user]);

  async function loadTestimonials() {
    const { data } = await supabase.from('testimonials').select('*').order('display_order', { ascending: true });
    if (data) setTestimonials(data as Testimonial[]);
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length || !editing) return;
    const file = e.target.files[0];
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    
    let finalAvatarUrl = editing.avatar_url;
    
    if (avatarFile) {
      try {
        const fileName = `avatar-${Date.now()}-${avatarFile.name.replace(/\s+/g, '-')}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { cacheControl: '3600', upsert: false });
          
        if (uploadError) {
          if (uploadError.message.includes('bucket not found')) {
            // Auto-create bucket if not exists
            await supabase.storage.createBucket('avatars', { public: true });
            await supabase.storage.from('avatars').upload(fileName, avatarFile, { cacheControl: '3600', upsert: false });
          } else {
            throw uploadError;
          }
        }
        
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalAvatarUrl = publicUrl;
      } catch (err: any) {
        console.error('Avatar upload failed:', err);
        alert('Upload failed: ' + err.message);
        setSaving(false);
        return;
      }
    }
    
    const payload = {
      ...editing,
      avatar_url: finalAvatarUrl,
      star_rating: editing.star_rating || 5,
      is_published: editing.is_published !== false,
      display_order: editing.display_order || testimonials.length
    };

    let error;
    if (editing.id) {
      const { error: err } = await supabase.from('testimonials').update(payload).eq('id', editing.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('testimonials').insert([payload]);
      error = err;
    }

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      setEditing(null);
      loadTestimonials();
    }
    setSaving(false);
  }

  async function deleteTestimonial(id: string) {
    if (confirm('Delete this testimonial?')) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) {
        alert('Delete failed: ' + error.message);
      } else {
        loadTestimonials();
      }
    }
  }

  async function togglePublished(id: string, current: boolean) {
    await supabase.from('testimonials').update({ is_published: !current }).eq('id', id);
    loadTestimonials();
  }

  async function updateOrder(id: string, currentOrder: number, direction: 'up' | 'down') {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    await supabase.from('testimonials').update({ display_order: newOrder }).eq('id', id);
    loadTestimonials();
  }

  async function handleReorder(newOrder: Testimonial[]) {
    setTestimonials(newOrder);
    const updates = newOrder.map((t, index) => ({
      id: t.id,
      display_order: index
    }));

    for (const update of updates) {
      await supabase.from('testimonials').update({ display_order: update.display_order }).eq('id', update.id);
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-mono text-muted">/ loading_testimonials...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-display text-[var(--admin-text)]">Testimonials</h1>
            <p className="text-[var(--admin-text-muted)] text-sm">Manage social proof and client feedback.</p>
          </div>
          <button 
            onClick={() => {
              setAvatarFile(null);
              setAvatarPreview(null);
              setEditing({ 
                quote_text: '', 
                person_name: '', 
                person_role: '', 
                person_company: '', 
                star_rating: 5, 
                is_published: true,
                display_order: testimonials.length 
              });
            }} 
            className="flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold"
            style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}
          >
            <Plus size={18} />
            <span>Add New</span>
          </button>
        </div>

        <Reorder.Group axis="y" values={testimonials} onReorder={handleReorder} className="space-y-4">
          {testimonials.map((t) => (
            <Reorder.Item 
              key={t.id} 
              value={t}
              className="relative"
            >
              <GlassCard 
                className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 group !bg-[var(--admin-card)] !border-[var(--admin-border)] relative cursor-default"
              >
                {/* Drag Handle */}
                <div className="shrink-0 pt-2 flex items-center justify-center text-[var(--admin-text-muted)] cursor-grab active:cursor-grabbing hover:text-[var(--admin-accent)] transition-colors p-2 touch-none">
                  <GripVertical size={20} />
                </div>

                {/* Main Content Group */}
                <div className="flex-1 flex flex-col md:flex-row gap-6 w-full">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[var(--admin-input-bg)] border border-[var(--admin-border)] flex-shrink-0 shadow-inner group-hover:border-[var(--admin-accent)]/50 transition-all mx-auto md:mx-0">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 95%)' }}>
                        <User size={32} />
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 space-y-2 text-center md:text-left min-w-0">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <h3 className="text-lg font-display font-bold text-[var(--admin-text)] truncate">{t.person_name}</h3>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star 
                            key={idx} 
                            size={14} 
                            className={idx < t.star_rating ? 'fill-[var(--accent-lime)] text-[var(--accent-lime)]' : 'text-[var(--admin-text-muted)]/20'} 
                            style={idx < t.star_rating ? { fill: 'var(--accent-lime)', color: 'var(--accent-lime)' } : {}}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--admin-text-muted)] italic leading-relaxed">"{t.quote_text}"</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono" style={{ color: 'var(--admin-accent)' }}>
                      <span className="font-bold">{t.person_role}</span>
                      <span className="opacity-40">@</span>
                      <span>{t.person_company}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Area */}
                <div className="shrink-0 flex md:flex-col items-center gap-4 pt-2 md:pl-6 md:border-l md:border-[var(--admin-border)] w-full md:w-auto justify-center">
                  <button 
                    onClick={() => togglePublished(t.id, t.is_published)}
                    className={`text-[10px] font-mono px-4 py-1.5 rounded-full border transition-all font-bold tracking-wider ${
                      t.is_published 
                        ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                        : 'bg-[var(--admin-input-bg)] text-[var(--admin-text-muted)] border-[var(--admin-border)]'
                    }`}
                  >
                    {t.is_published ? 'PUBLISHED' : 'DRAFT'}
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                        setEditing(t);
                      }} 
                      className="p-2.5 rounded-xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:border-[var(--admin-accent)] transition-all shadow-sm"
                      title="Edit Testimonial"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteTestimonial(t.id)} 
                      className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-[var(--admin-text-muted)] hover:text-red-400 hover:border-red-500/30 transition-all shadow-sm"
                      title="Delete Testimonial"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-0 md:p-4">
          <div className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl bg-[var(--admin-bg)] border-none md:border md:border-[var(--admin-border)] rounded-none md:rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-surface), transparent 70%)' }}>
              <h2 className="text-xl font-display text-[var(--admin-text)]">{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</h2>
              <button onClick={() => setEditing(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <div className="flex flex-col items-center gap-4 mb-8">
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)]">Client Avatar</label>
                <style>
                  {`
                    .avatar-hover-overlay:hover {
                      opacity: 1 !important;
                    }
                  `}
                </style>
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    border: '2px dashed var(--admin-border)',
                    cursor: 'pointer', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--admin-input-bg)',
                    position: 'relative',
                  }}
                >
                  {avatarPreview || editing.avatar_url ? (
                    <img src={avatarPreview || editing.avatar_url || ''} alt="Avatar preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <UserCircle size={28} className="mx-auto" color="var(--admin-text-muted)" />
                      <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>Upload</p>
                    </div>
                  )}
                  {(avatarPreview || editing.avatar_url) && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: '150ms',
                    }}
                      className="avatar-hover-overlay"
                    >
                      <Pencil size={16} color="white" />
                    </div>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleAvatarSelect}
                />
                <p className="text-[10px] text-[var(--admin-text-muted)] font-mono uppercase tracking-widest opacity-50">PNG, JPG, WebP. Max 10MB.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Quote Text</label>
                  <textarea 
                    value={editing.quote_text || ''} 
                    onChange={e => setEditing({...editing, quote_text: e.target.value})}
                    className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm h-24 focus:outline-none transition-all"
                    style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                    placeholder="Enter the client's testimonial..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Person Name</label>
                    <input 
                      type="text" 
                      value={editing.person_name || ''} 
                      onChange={e => setEditing({...editing, person_name: e.target.value})}
                      className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all"
                      style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Star Rating</label>
                    <div className="flex gap-1 md:gap-2 p-2 md:p-3 rounded-xl justify-center items-center" style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star} 
                          onClick={() => setEditing({...editing, star_rating: star})}
                          className="transition-transform active:scale-90 p-1"
                        >
                          <Star size={20} className={star <= (editing.star_rating || 0) ? 'text-accent-lime fill-accent-lime' : 'text-[var(--admin-text-muted)]/20'} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Role</label>
                    <input 
                      type="text" 
                      value={editing.person_role || ''} 
                      onChange={e => setEditing({...editing, person_role: e.target.value})}
                      className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all"
                      style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                      placeholder="e.g. Project Director"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Company</label>
                    <input 
                      type="text" 
                      value={editing.person_company || ''} 
                      onChange={e => setEditing({...editing, person_company: e.target.value})}
                      className="w-full rounded-xl p-4 text-[var(--admin-text)] text-sm focus:outline-none transition-all"
                      style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
                      placeholder="e.g. RIMA Nigeria"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pb-24 md:pb-6 border-t border-[var(--admin-border)] flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 font-mono text-xs" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-surface), transparent 50%)' }}>
              <label className="flex items-center gap-2 cursor-pointer text-[var(--admin-text)] w-full sm:w-auto justify-center">
                <input type="checkbox" checked={editing.is_published !== false} onChange={e => setEditing({...editing, is_published: e.target.checked})} />
                MARK_AS_PUBLISHED
              </label>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => setEditing(null)} className="flex-1 sm:flex-none px-6 py-2 rounded-xl text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none min-w-[140px] flex items-center justify-center gap-2 px-6 py-2 rounded-xl transition-all font-bold" style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
