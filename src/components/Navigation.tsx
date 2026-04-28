import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../lib/supabase';

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [navText, setNavText] = useState('Live Status');
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadNav() {
      const [{ data: contentData }, { data: settingsData }] = await Promise.all([
        supabase.from('page_content').select('field_value').eq('page', 'home').eq('section', 'nav').eq('field_key', 'live_status_text').single(),
        supabase.from('site_settings').select('key, value')
      ]);

      if (contentData && contentData.field_value) setNavText(contentData.field_value);
      
      if (settingsData) {
        const smap: Record<string, string> = {};
        settingsData.forEach(r => smap[r.key] = r.value);
        setSettings(smap);
      }
    }
    loadNav();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleHireClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/gis-lab') {
      navigate('/contact');
    } else if (location.pathname.startsWith('/projects')) {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/contact');
      }
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/contact');
      }
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b transition-colors"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-mono text-lg font-bold flex items-center gap-2" style={{ color: 'var(--accent-blue)' }}>
          {settings.brand_logo_url ? (
            <img src={settings.brand_logo_url} alt="Logo" className="h-6 w-auto object-contain" />
          ) : (
            settings.brand_name || 'EBUBE_CHUKWU.sh'
          )}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            01_HOME
          </Link>
          <Link to="/gis-lab" className={`nav-link ${isActive('/gis-lab') ? 'active' : ''}`}>
            02_PROJECT
          </Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
            03_CONTACT
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--accent-lime)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-lime)' }} />
            <span>{navText}</span>
          </div>
          <button
            onClick={toggle}
            className="theme-toggle"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          </button>
          <button onClick={handleHireClick} className="btn-hire">
            {location.pathname === '/gis-lab' ? 'GET IN TOUCH' : 'HIRE ME'}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggle}
            className="theme-toggle"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden border-t transition-colors"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div className="px-4 py-4 space-y-4">
            <Link to="/" className="block nav-link" onClick={() => setOpen(false)}>
              01_HOME
            </Link>
            <Link to="/gis-lab" className="block nav-link" onClick={() => setOpen(false)}>
              02_PROJECT
            </Link>
            <Link to="/contact" className="block nav-link" onClick={() => setOpen(false)}>
              03_CONTACT
            </Link>
            <button onClick={(e) => { setOpen(false); handleHireClick(e); }} className="btn-hire w-full justify-center">
              {location.pathname === '/gis-lab' ? 'GET IN TOUCH' : 'HIRE ME'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
