import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/GlassCard';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Cpu, 
  Image as ImageIcon, 
  Loader2, 
  ArrowRight,
  Save,
  Sun,
  Moon,
  ArrowLeft,
  Play,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminTheme } from '../../context/AdminThemeContext';

export default function AdminSettings() {
  const { user, loading: authLoading } = useAuth();
  const { adminTheme, toggleAdminTheme } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<'brand' | 'technical' | 'appearance' | 'mockup'>('brand');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);
  const [uploadingMockup, setUploadingMockup] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  async function loadSettings() {
    const { data } = await supabase.from('site_settings').select('key,value');
    if (data) {
      const s: Record<string, string> = {};
      data.forEach(item => s[item.key] = item.value);
      setSettings(s);
    }
  }

  const handleSave = async (group: 'technical' | 'brand' | 'mockup') => {
    setSaving(true);
    try {
      let keysToSave: string[] = [];
      if (group === 'technical') {
        keysToSave = ['build_version', 'last_sync', 'system_status'];
      } else if (group === 'brand') {
        keysToSave = ['brand_name', 'brand_logo_url', 'og_image_url', 'meta_title_home', 'meta_description_home', 'social_linkedin', 'social_github', 'social_x', 'social_whatsapp', 'contact_email'];
      } else if (group === 'mockup') {
        keysToSave = ['mockup_video_url', 'mockup_screen_1', 'mockup_screen_2', 'mockup_screen_3', 'mockup_screen_4', 'mockup_screen_5', 'mockup_screen_6', 'mockup_screen_dark', 'mockup_screen_light'];
      }

      for (const key of keysToSave) {
        if (settings[key] !== undefined) {
           await supabase.from('site_settings').upsert({ key, value: settings[key] }, { onConflict: 'key' });
        }
      }
      
      setMessage({ text: `${group.charAt(0).toUpperCase() + group.slice(1)} settings updated.`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ text: 'Update failed.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  async function handleMockupUpload(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingMockup(key);

    try {
      const fileName = `mockup/${key}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('mockup-screens').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('mockup-screens').getPublicUrl(fileName);
      setSettings({ ...settings, [key]: publicUrl });
      await supabase.from('site_settings').upsert({ key, value: publicUrl }, { onConflict: 'key' });
      
      setMessage({ text: 'Asset uploaded and updated.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage({ text: 'Upload failed.', type: 'error' });
    } finally {
      setUploadingMockup(null);
    }
  }

  // BUG-02 FIX: Upload brand logo to a dedicated brand/ prefix in project-covers bucket
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      const fileName = `brand/logo-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('project-covers').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('project-covers').getPublicUrl(fileName);
      setSettings({ ...settings, brand_logo_url: publicUrl });
      await supabase.from('site_settings').upsert({ key: 'brand_logo_url', value: publicUrl }, { onConflict: 'key' });
      
      setMessage({ text: 'Logo uploaded and updated.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Logo upload failed:', err);
      setMessage({ text: 'Logo upload failed.', type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  async function handleOgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingOg(true);

    try {
      const fileName = `brand/og-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('project-covers').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('project-covers').getPublicUrl(fileName);
      setSettings({ ...settings, og_image_url: publicUrl });
      await supabase.from('site_settings').upsert({ key: 'og_image_url', value: publicUrl }, { onConflict: 'key' });
      
      setMessage({ text: 'OG Image uploaded and updated.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('OG upload failed:', err);
      setMessage({ text: 'OG upload failed.', type: 'error' });
    } finally {
      setUploadingOg(false);
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-mono">/ access_granted..._loading_config...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl">
      <div className="mb-2 md:mb-6">
        <Link to="/console" className="inline-flex items-center gap-2 text-xs font-mono text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors bg-[var(--admin-card)] px-4 py-2 rounded-full border border-[var(--admin-border)] md:bg-transparent md:border-none md:p-0">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-display text-[var(--admin-text)]">System Settings</h1>
          <p className="text-[var(--admin-text-muted)] text-sm">Configure core identity, technical metadata, and global constants.</p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded-full text-xs font-mono animate-in slide-in-from-top-2 border ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? 'SUCCESS::' : 'ERROR::'}{message.text.toUpperCase()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sidebar Nav for Settings */}
        <div className="md:col-span-1 space-y-4">
            <GlassCard className="!p-2 !bg-[var(--admin-card)] !border-[var(--admin-border)]">
                <div className="space-y-1">
                    <button 
                        onClick={() => setActiveTab('brand')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-sm ${activeTab === 'brand' ? 'text-[var(--admin-accent)] font-bold' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'}`}
                        style={{ backgroundColor: activeTab === 'brand' ? 'color-mix(in srgb, var(--admin-accent), transparent 90%)' : 'transparent' }}
                    >
                        <Shield size={18} />
                        Identity & Brand
                    </button>
                    <button 
                        onClick={() => setActiveTab('mockup')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-sm ${activeTab === 'mockup' ? 'text-[var(--admin-accent)] font-bold' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'}`}
                        style={{ backgroundColor: activeTab === 'mockup' ? 'color-mix(in srgb, var(--admin-accent), transparent 90%)' : 'transparent' }}
                    >
                        <Play size={18} />
                        Mockup Assets
                    </button>
                    <button 
                        onClick={() => setActiveTab('technical')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-sm ${activeTab === 'technical' ? 'text-[var(--admin-accent)] font-bold' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'}`}
                        style={{ backgroundColor: activeTab === 'technical' ? 'color-mix(in srgb, var(--admin-accent), transparent 90%)' : 'transparent' }}
                    >
                        <Cpu size={18} />
                        Core Technical
                    </button>
                    <button 
                        onClick={() => setActiveTab('appearance')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-sm ${activeTab === 'appearance' ? 'text-[var(--admin-accent)] font-bold' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'}`}
                        style={{ backgroundColor: activeTab === 'appearance' ? 'color-mix(in srgb, var(--admin-accent), transparent 90%)' : 'transparent' }}
                    >
                        <SettingsIcon size={18} />
                        Admin Appearance
                    </button>
                </div>
            </GlassCard>
            
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 95%)', border: '1px solid color-mix(in srgb, var(--admin-accent), transparent 80%)' }}>
                <p className="text-[10px] font-mono uppercase tracking-widest mb-2 font-bold flex items-center gap-1" style={{ color: 'var(--admin-accent)' }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--admin-accent)' }} />
                    System Healthy
                </p>
                <p className="text-[10px] leading-tight font-mono" style={{ color: 'var(--admin-text-muted)' }}>
                    All core services reporting 100% uptime. Database synchronized with Edge Nodes.
                </p>
            </div>
        </div>

        {/* Content Area ΓÇö BUG-01 FIX: each tab is fully self-contained */}
        <div className="md:col-span-2 space-y-8">
          
          {/* ΓöÇΓöÇ APPEARANCE TAB ΓöÇΓöÇ */}
          {activeTab === 'appearance' && (
            <GlassCard className="space-y-6 !bg-[var(--admin-card)] !border-[var(--admin-border)]">
                <div className="flex items-center gap-2 text-[var(--admin-text)] font-display text-lg border-b border-[var(--admin-border)] pb-4">
                    <SettingsIcon size={20} className="text-accent-blue" />
                    Admin Display
                </div>
                
                <div className="p-6 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-bold text-[var(--admin-text)]">Admin Dashboard Theme</p>
                            <p className="text-xs text-[var(--admin-text-muted)]">This setting only affects the admin dashboard and does not change the public portfolio theme.</p>
                        </div>
                        <button 
                            onClick={toggleAdminTheme}
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--admin-surface)] border border-[var(--admin-border)] text-accent-blue hover:scale-110 transition-transform shadow-lg"
                        >
                            {adminTheme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 text-[var(--admin-text-muted)] text-[10px] font-mono px-2">
                    <Cpu size={12} />
                    <span>PREFERENCE_STORED_IN: LOCAL_STORAGE</span>
                </div>
            </GlassCard>
          )}

          {/* ΓöÇΓöÇ BRAND TAB ΓöÇΓöÇ */}
          {activeTab === 'brand' && (
            <GlassCard className="space-y-6 !bg-[var(--admin-card)] !border-[var(--admin-border)]">
              <div className="flex items-center gap-2 text-[var(--admin-text)] font-display text-lg border-b border-[var(--admin-border)] pb-4">
                  <ImageIcon size={20} className="text-accent-blue" />
                  Brand Assets
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--admin-border)] rounded-3xl group hover:border-[var(--admin-accent)] transition-colors">
                      <p className="text-sm font-bold text-[var(--admin-text)] mb-4">Brand Logo</p>
                      <div className="w-24 h-24 rounded-2xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] overflow-hidden mb-4 relative shadow-2xl">
                          {settings.brand_logo_url ? (
                              <img src={settings.brand_logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                                  <ImageIcon size={32} />
                              </div>
                          )}
                          {uploading && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <Loader2 className="animate-spin text-accent-blue" />
                              </div>
                          )}
                      </div>
                      <label className="btn-primary cursor-pointer !py-2 !px-4 text-xs">
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                          Upload New Logo
                      </label>
                      <p className="text-[10px] text-[var(--admin-text-muted)] mt-3 font-mono">Square SVG or PNG</p>
                  </div>

                  {/* OG Image Upload */}
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--admin-border)] rounded-3xl group hover:border-[var(--admin-accent)] transition-colors">
                      <p className="text-sm font-bold text-[var(--admin-text)] mb-4 text-center">Social Share Image (OG)</p>
                      <div className="w-full max-w-[200px] aspect-[1.91/1] rounded-2xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] overflow-hidden mb-4 relative shadow-2xl">
                          {settings.og_image_url ? (
                              <img src={settings.og_image_url} alt="OG Preview" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                                  <ImageIcon size={32} />
                              </div>
                          )}
                          {uploadingOg && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <Loader2 className="animate-spin text-accent-blue" />
                              </div>
                          )}
                      </div>
                      <label className="btn-primary cursor-pointer !py-2 !px-4 text-xs">
                          <input type="file" accept="image/*" className="hidden" onChange={handleOgUpload} disabled={uploadingOg} />
                          Upload OG Image
                      </label>
                      <p className="text-[10px] text-[var(--admin-text-muted)] mt-3 font-mono text-center">1200├ù630px recommended</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Display Name</label>
                          <input 
                              type="text" 
                              value={settings.brand_name || ''} 
                              onChange={e => setSettings({...settings, brand_name: e.target.value})}
                              className="w-full rounded-xl p-4 text-sm focus:outline-none transition-all" 
                              style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Contact Email</label>
                          <input 
                              type="email" 
                              value={settings.contact_email || ''} 
                              onChange={e => setSettings({...settings, contact_email: e.target.value})}
                              placeholder="contact@ebube.sh"
                              className="w-full rounded-xl p-4 text-sm focus:outline-none transition-all" 
                              style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Home Meta Title</label>
                      <input 
                          type="text" 
                          value={settings.meta_title_home || ''} 
                          onChange={e => setSettings({...settings, meta_title_home: e.target.value})}
                          placeholder="Ebubechukwu Nwagbara ΓÇö GIS & UX Designer | Port Harcourt"
                          className="w-full rounded-xl p-4 text-sm focus:outline-none transition-all" 
                          style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Home Meta Description</label>
                      <textarea 
                          value={settings.meta_description_home || ''} 
                          onChange={e => setSettings({...settings, meta_description_home: e.target.value})}
                          placeholder="Cartographer of Systems. Architect of Experiences. GIS professional and UX designer building spatial intelligence tools and human-centered digital products."
                          className="w-full rounded-xl p-4 text-sm focus:outline-none transition-all h-24" 
                          style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">LinkedIn URL</label>
                          <input 
                              type="url" 
                              value={settings.social_linkedin || ''} 
                              onChange={e => setSettings({...settings, social_linkedin: e.target.value})}
                              placeholder="https://linkedin.com/in/..."
                              className="w-full rounded-xl p-4 text-sm focus:outline-none transition-all" 
                              style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">GitHub URL</label>
                          <input 
                              type="url" 
                              value={settings.social_github || ''} 
                              onChange={e => setSettings({...settings, social_github: e.target.value})}
                              placeholder="https://github.com/..."
                              className="w-full rounded-xl p-4 text-sm focus:outline-none transition-all" 
                              style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                          />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">X (Twitter) URL</label>
                          <input 
                              type="url" 
                              value={settings.social_x || ''} 
                              onChange={e => setSettings({...settings, social_x: e.target.value})}
                              placeholder="https://x.com/..."
                              className="w-full rounded-xl p-4 text-sm focus:outline-none transition-all" 
                              style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">WhatsApp Link</label>
                          <input 
                              type="url" 
                              value={settings.social_whatsapp || ''} 
                              onChange={e => setSettings({...settings, social_whatsapp: e.target.value})}
                              placeholder="https://wa.me/234..."
                              className="w-full rounded-xl p-4 text-sm focus:outline-none transition-all" 
                              style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                          />
                      </div>
                  </div>
              </div>

              <button 
                  onClick={() => handleSave('brand')} 
                  disabled={saving}
                  className="btn-primary w-full justify-center gap-2 py-4"
              >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Update Brand Identity
              </button>
            </GlassCard>
          )}

          {/* ΓöÇΓöÇ TECHNICAL TAB ΓöÇΓöÇ */}
          {activeTab === 'technical' && (
            <div className="space-y-8">
              <GlassCard className="space-y-6 !bg-[var(--admin-card)] !border-[var(--admin-border)]">
                    <div className="flex items-center gap-2 text-[var(--admin-text)] font-display text-lg border-b border-[var(--admin-border)] pb-4">
                        <Cpu size={20} className="text-accent-lime" />
                        Technical Control
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--admin-border)]" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-bg), white 2%)' }}>
                            <div>
                                <p className="text-sm font-bold text-[var(--admin-text)]">Build Version</p>
                                <p className="text-xs text-[var(--admin-text-muted)]">Current deployment release tag.</p>
                            </div>
                            <input 
                                type="text" 
                                value={settings.build_version || '1.0.0'} 
                                onChange={e => setSettings({...settings, build_version: e.target.value})}
                                className="w-24 rounded-lg px-3 py-1 text-xs text-center font-mono focus:outline-none" 
                                style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-accent)' }}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--admin-border)]" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-bg), white 2%)' }}>
                            <div>
                                <p className="text-sm font-bold text-[var(--admin-text)]">System Refresh</p>
                                <p className="text-xs text-[var(--admin-text-muted)]">Force dynamic content cache purge.</p>
                            </div>
                            <button className="flex items-center gap-2 text-xs font-bold transition-colors hover:text-[var(--admin-accent)]" style={{ color: 'var(--admin-text-muted)' }}>
                               PURGE_CACHE <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleSave('technical')} 
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all font-bold border border-[var(--admin-border)]"
                        style={{ backgroundColor: 'transparent', color: 'var(--admin-text)' }}
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Commit System Changes
                    </button>
              </GlassCard>

              {/* Mobile Sign Out */}
              <div className="md:hidden">
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ArrowRight size={14} className="rotate-180" />
                  Terminate Session (Sign Out)
                </button>
              </div>
            </div>
          )}

          {/* ── MOCKUP TAB ── */}
          {activeTab === 'mockup' && (
            <div className="space-y-8">
              <GlassCard className="space-y-6 !bg-[var(--admin-card)] !border-[var(--admin-border)]">
                <div className="flex items-center gap-2 text-[var(--admin-text)] font-display text-lg border-b border-[var(--admin-border)] pb-4">
                  <Play size={20} className="text-accent-blue" />
                  Interactive Mockup Demo
                </div>

                <div className="p-6 bg-blue-600/5 border border-blue-600/20 rounded-2xl">
                  <h4 className="text-sm font-bold text-[var(--admin-text)] mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-accent-blue" />
                    Interactive Video Asset
                  </h4>
                  <p className="text-xs text-[var(--admin-text-muted)] leading-relaxed mb-6 font-mono">
                    Upload a screen recording of your live site. This replaces the fallback screenshots on the /mockup page.
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    <div className="aspect-video bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl overflow-hidden relative group">
                      {settings.mockup_video_url ? (
                        <video src={settings.mockup_video_url} className="w-full h-full object-cover" muted />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--admin-text-muted)] gap-2">
                          <Play size={40} />
                          <span className="text-[10px] font-mono uppercase">No_Video_Recorded</span>
                        </div>
                      )}
                      {uploadingMockup === 'mockup_video_url' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="animate-spin text-accent-blue" />
                        </div>
                      )}
                    </div>
                    <label className="btn-primary w-full justify-center cursor-pointer">
                      <input type="file" accept="video/*" className="hidden" onChange={e => handleMockupUpload(e, 'mockup_video_url')} disabled={!!uploadingMockup} />
                      {uploadingMockup === 'mockup_video_url' ? 'UPLOADING...' : 'UPLOAD SCREEN RECORDING (MP4)'}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'mockup_screen_1', label: '1. Home Hero' },
                    { key: 'mockup_screen_2', label: '2. Projects Grid' },
                    { key: 'mockup_screen_3', label: '3. GIS Lab' },
                    { key: 'mockup_screen_4', label: '4. AI Audit' },
                    { key: 'mockup_screen_5', label: '5. Admin CMS' },
                    { key: 'mockup_screen_6', label: '6. Rich Editor' },
                    { key: 'mockup_screen_dark', label: 'Theme: Dark' },
                    { key: 'mockup_screen_light', label: 'Theme: Light' },
                  ].map(item => (
                    <div key={item.key} className="p-4 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-[var(--admin-text-muted)] uppercase tracking-wider">{item.label}</span>
                        {settings[item.key] && <div className="w-1.5 h-1.5 rounded-full bg-accent-lime" />}
                      </div>
                      <div className="aspect-video bg-black/20 rounded-lg overflow-hidden relative border border-[var(--admin-border)]">
                        {settings[item.key] ? (
                          <img src={settings[item.key]} alt={item.label} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        {uploadingMockup === item.key && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="animate-spin text-accent-blue" />
                          </div>
                        )}
                      </div>
                      <label className="w-full py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-[10px] font-bold text-[var(--admin-text)] flex items-center justify-center cursor-pointer hover:bg-[var(--admin-border)] transition-colors">
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleMockupUpload(e, item.key)} disabled={!!uploadingMockup} />
                        REPLACE
                      </label>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
                    <AlertCircle size={16} />
                    Recording Instructions
                  </div>
                  <ol className="text-[10px] text-[var(--admin-text-muted)] font-mono space-y-2 list-decimal ml-4">
                    <li>Use Loom or OBS to record your screen at 1080p.</li>
                    <li>00s-18s: Homepage Hero to Projects.</li>
                    <li>18s-35s: Filter projects and open one.</li>
                    <li>35s-55s: GIS Lab globe interaction.</li>
                    <li>55s-70s: Use the AI Audit tool.</li>
                    <li>70s-82s: Toggle Dark/Light mode.</li>
                    <li>82s-110s: Admin panel overview.</li>
                    <li>110s-130s: Rich text editor demo.</li>
                  </ol>
                </div>
              </GlassCard>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
