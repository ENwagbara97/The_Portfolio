import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/GlassCard';
import { Save, Loader2, Play, Layout, Terminal, Globe, Cpu, Type, Moon, HelpCircle } from 'lucide-react';

export default function AdminSettings() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  async function loadSettings() {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const s: any = {};
      data.forEach(item => s[item.key] = item.value);
      setSettings(s);
    }
  }

  async function handleSave() {
    setSaving(true);
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value
    }));

    const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' });

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      alert('Settings saved!');
    }
    setSaving(false);
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-mono text-muted">/ loading_settings...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
            <Layout size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Mockup & Global Settings</h1>
            <p className="text-sm text-[var(--admin-text-muted)] font-mono">/ site_configuration_system</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--admin-text-muted)] hover:text-white transition-all"
          >
            <HelpCircle size={18} />
            <span>Guide</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Mockup Configuration */}
        <div className="space-y-6">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#2563EB] font-bold">Mockup Video & Hero</h2>
          <GlassCard className="p-6 space-y-6 !bg-[var(--admin-card)] !border-[var(--admin-border)]">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-[var(--admin-text-muted)]">Mockup Video URL (MP4)</label>
              <input 
                type="text" 
                value={settings.mockup_video_url || ''}
                onChange={e => setSettings({...settings, mockup_video_url: e.target.value})}
                className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] transition-colors"
                placeholder="https://your-supabase-url.com/video.mp4"
              />
              <p className="text-[10px] text-[var(--admin-text-muted)] italic">Hosting on Supabase Storage or Cloudinary is recommended.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-[var(--admin-text-muted)]">Brand Name (Sidebar)</label>
              <input 
                type="text" 
                value={settings.brand_name || ''}
                onChange={e => setSettings({...settings, brand_name: e.target.value})}
                className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] transition-colors"
                placeholder="EBUBE_CHUKWU.sh"
              />
            </div>
          </GlassCard>

          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#2563EB] font-bold">Screenshot Fallbacks</h2>
          <GlassCard className="p-6 space-y-4 !bg-[var(--admin-card)] !border-[var(--admin-border)]">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} className="space-y-2">
                <label className="text-xs font-mono uppercase text-[var(--admin-text-muted)]">Screen {num} URL</label>
                <input 
                  type="text" 
                  value={settings[`mockup_screen_${num}`] || ''}
                  onChange={e => setSettings({...settings, [`mockup_screen_${num}`]: e.target.value})}
                  className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  placeholder="https://.../screenshot.png"
                />
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Mode & Details */}
        <div className="space-y-6">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#2563EB] font-bold">Theme Screenshots</h2>
          <GlassCard className="p-6 space-y-4 !bg-[var(--admin-card)] !border-[var(--admin-border)]">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-[var(--admin-text-muted)]">Dark Mode Screenshot</label>
              <input 
                type="text" 
                value={settings.mockup_screen_dark || ''}
                onChange={e => setSettings({...settings, mockup_screen_dark: e.target.value})}
                className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-[var(--admin-text-muted)]">Light Mode Screenshot</label>
              <input 
                type="text" 
                value={settings.mockup_screen_light || ''}
                onChange={e => setSettings({...settings, mockup_screen_light: e.target.value})}
                className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </GlassCard>

          {showHelp && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#2563EB] font-bold mb-4">Mockup Video Guide</h2>
              <GlassCard className="p-6 !bg-[#2563EB] !border-none text-white shadow-2xl shadow-blue-500/20">
                <div className="flex items-start gap-4">
                  <Play className="shrink-0 mt-1" />
                  <div className="space-y-4">
                    <p className="text-sm font-medium">To create the perfect cinematic video walkthrough, record your screen while navigating these sections in order:</p>
                    <ol className="text-xs space-y-3 list-decimal list-inside opacity-90 font-mono">
                      <li>0s-18s: Hover over Hero & Terminal.</li>
                      <li>18s-35s: Scroll through Projects.</li>
                      <li>35s-55s: Interact with the 3D Globe.</li>
                      <li>55s-70s: Use the AI Audit tool.</li>
                      <li>70s-82s: Toggle Dark/Light mode.</li>
                      <li>82s-110s: Admin panel overview.</li>
                      <li>110s-130s: Rich text editor demo.</li>
                    </ol>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
