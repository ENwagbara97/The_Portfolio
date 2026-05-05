import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  ClipboardList, 
  Settings, 
  Image as ImageIcon,
  ChevronRight,
  LogOut,
  User,
  Globe,
  Wrench
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/console' },
  { icon: FileText, label: 'Content Manager', path: '/console/content' },
  { icon: Briefcase, label: 'Project Manager', path: '/console/projects' },
  { icon: MessageSquare, label: 'Testimonials', path: '/console/testimonials' },
  { icon: ClipboardList, label: 'Contact Enquiries', path: '/console/enquiries' },
  { icon: ImageIcon, label: 'Media Library', path: '/console/media' },
  { icon: Globe, label: 'GIS Lab Manager', path: '/console/gis-lab' },
  { icon: Wrench, label: 'GIS Toolbox', path: '/console/gis-tools' },
  { 
    icon: Settings, 
    label: 'Settings', 
    path: '/console/settings',
    children: [
      { label: 'General', path: '/console/settings' },
      { label: 'CV Manager', path: '/console/settings/cv' },
    ]
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [brandName, setBrandName] = useState('EBUBE_CHUKWU.sh');

  useEffect(() => {
    async function loadBrand() {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'brand_name').single();
      if (data && data.value) setBrandName(data.value);
    }
    loadBrand();
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col transition-colors duration-300" 
           style={{ backgroundColor: 'var(--admin-sidebar-bg)', borderRight: '1px solid var(--admin-border)' }}>
      <div className="p-6 border-b border-[var(--admin-border)]">
        <Link to="/" className="font-mono text-lg font-bold text-[var(--admin-accent)]">
          {brandName}
        </Link>
        <p className="text-[10px] font-mono mt-1 uppercase tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>Admin Control Plane</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.label}>
            <Link
              to={item.path}
              className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                isActive(item.path) 
                  ? 'text-[var(--admin-accent)] font-semibold shadow-sm' 
                  : 'hover:text-[var(--admin-text)]'
              }`}
              style={{ backgroundColor: isActive(item.path) ? 'color-mix(in srgb, var(--admin-accent), transparent 90%)' : 'transparent' }}
            >
              <div className="flex items-center gap-3" style={{ color: isActive(item.path) ? 'var(--admin-accent)' : 'var(--admin-text-muted)' }}>
                <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                <span className="text-sm tracking-tight">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive(item.path) ? 'opacity-100' : ''}`} />
            </Link>
            
            {item.children && isParentActive(item.path) && (
              <div className="ml-9 mt-1 space-y-1">
                {item.children.map(child => (
                  <Link
                    key={child.label}
                    to={child.path}
                    className={`block p-2 rounded-lg text-xs transition-colors ${
                      isActive(child.path) 
                        ? 'text-[var(--admin-accent)] font-bold' 
                        : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--admin-border)] space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--admin-border)]" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-bg), white 3%)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 90%)', color: 'var(--admin-accent)' }}>
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-[var(--admin-text)]">{user?.email}</p>
            <p className="text-[10px] font-mono uppercase text-[var(--admin-text-muted)]">System Admin</p>
          </div>
        </div>
        
        <button 
          onClick={() => signOut?.()}
          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut size={20} />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
}
