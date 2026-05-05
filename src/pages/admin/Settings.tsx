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
  ArrowLeft
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

  // ... (keep logo/og handlers)

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl">
      {/* ... header ... */}
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
            {/* ... uptime card ... */}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* ... Brand, Appearance, Technical tabs ... */}

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
}          </div>
          )}

        </div>
      </div>
    </div>
  );
}
