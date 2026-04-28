import { Linkedin, Github, Mail, ShieldCheck, Lock, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

// Inline X (formerly Twitter) icon since lucide doesn't have the new X logo
function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Footer() {
  const [c, setContent] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadFooter() {
      const [contentRes, settingsRes] = await Promise.all([
        supabase.from('page_content').select('field_key, field_value').eq('page', 'global').eq('section', 'footer'),
        supabase.from('site_settings').select('key, value')
      ]);

      if (contentRes.data) {
        const cmap: Record<string, string> = {};
        contentRes.data.forEach(r => {
          if (r.field_value) cmap[r.field_key] = r.field_value;
        });
        setContent(cmap);
      }

      if (settingsRes.data) {
        const smap: Record<string, string> = {};
        settingsRes.data.forEach(r => {
          if (r.value) smap[r.key] = r.value;
        });
        setSettings(smap);
      }
    }
    loadFooter();
  }, []);

  return (
    <footer
      className="border-t transition-colors mt-auto"
      style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
                {settings['brand_logo_url'] ? (
                    <img src={settings['brand_logo_url']} alt="Logo" className="h-8 w-auto object-contain" />
                ) : (
                    <h3 className="font-mono text-xl font-bold text-accent-blue">
                        {settings['brand_name'] || 'EBUBE_CHUKWU.sh'}
                    </h3>
                )}
            </div>
            <p className="text-sm max-w-sm leading-relaxed text-secondary italic">
              {c['bio_tagline'] || 'Cartographer of Systems. Architect of Experiences. Mapping the gap between spatial data and human interaction.'}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted">Navigation</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-secondary hover:text-accent-blue transition-colors">01_HOME</Link>
              <Link to="/gis-lab" className="text-sm text-secondary hover:text-accent-blue transition-colors">02_PROJECT</Link>
              <Link to="/contact" className="text-sm text-secondary hover:text-accent-blue transition-colors">03_CONTACT</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted">Connect</h4>
            <div className="flex gap-3 flex-wrap">
              {(settings['social_linkedin'] || settings['contact_linkedin']) && (
                <a href={settings['social_linkedin'] || settings['contact_linkedin']} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-surface border border-border-default flex items-center justify-center text-secondary hover:text-accent-blue hover:border-accent-blue transition-all" title="LinkedIn">
                  <Linkedin size={18} />
                </a>
              )}
              {(settings['social_x'] || settings['contact_twitter']) && (
                <a href={settings['social_x'] || settings['contact_twitter']} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-surface border border-border-default flex items-center justify-center text-secondary hover:text-accent-blue hover:border-accent-blue transition-all" title="X (Twitter)">
                  <XIcon size={16} />
                </a>
              )}
              {(settings['social_whatsapp'] || settings['contact_whatsapp']) && (
                <a href={settings['social_whatsapp'] || settings['contact_whatsapp']} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-surface border border-border-default flex items-center justify-center text-secondary hover:text-[#25D366] hover:border-[#25D366] transition-all" title="WhatsApp">
                  <WhatsAppIcon size={18} />
                </a>
              )}
              {(settings['social_github'] || settings['contact_github']) && (
                <a href={settings['social_github'] || settings['contact_github']} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-surface border border-border-default flex items-center justify-center text-secondary hover:text-accent-blue hover:border-accent-blue transition-all" title="GitHub">
                  <Github size={18} />
                </a>
              )}
              <a href={`mailto:${settings['contact_email'] || 'contact@ebube.sh'}`} className="w-10 h-10 rounded-xl bg-surface border border-border-default flex items-center justify-center text-secondary hover:text-accent-blue hover:border-accent-blue transition-all" title="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] transition-colors font-mono uppercase tracking-tighter" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-4">
            <p>{c['copyright_text'] || `© ${new Date().getFullYear()} ${settings['brand_name'] || 'Ebubechukwu Nwagbara'}. All rights reserved.`}</p>
            <span className="hidden md:inline opacity-20">|</span>
            <p className="flex items-center gap-1"><ShieldCheck size={12} className="text-accent-lime opacity-50" /> Fully Encrypted AES-256</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-secondary">Build {settings['build_version'] || '1.0.0'}</span>
            <span className="opacity-20">|</span>
            <Link to="/login" className="flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity" title="Admin Access">
              <Lock size={10} />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
