import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminThemeProvider } from '../../context/AdminThemeContext';
import AdminSidebar from './AdminSidebar';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  ClipboardList,
  Settings,
} from 'lucide-react';

// Condensed mobile nav — top 5 most-used items only
const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/console' },
  { icon: FileText, label: 'Content', path: '/console/content' },
  { icon: Briefcase, label: 'Projects', path: '/console/projects' },
  { icon: ClipboardList, label: 'Enquiries', path: '/console/enquiries' },
  { icon: Settings, label: 'Settings', path: '/console/settings' },
];

function MobileAdminNav() {
  const location = useLocation();
  const isActive = (path: string) =>
    path === '/console' ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t safe-area-inset-bottom"
      style={{
        backgroundColor: 'var(--admin-sidebar-bg)',
        borderColor: 'var(--admin-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {mobileNavItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
          style={{
            color: isActive(item.path) ? 'var(--admin-accent)' : 'var(--admin-text-muted)',
          }}
        >
          <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 1.8} />
          <span className="text-[9px] font-mono uppercase tracking-widest">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-muted">
        / initializing_active_session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/console/login" replace />;
  }

  return (
    <AdminThemeProvider>
      <div id="admin-root" className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)] flex overflow-hidden transition-colors duration-300">
        {/* Permanent Sidebar for Desktop */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 h-screen overflow-y-auto bg-[var(--admin-bg)] relative">
          <div className="absolute top-0 right-0 p-4 md:p-8 z-10 hidden md:block">
            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-full border bg-[var(--admin-surface)] border-[var(--admin-border)] hover:bg-[var(--admin-accent)] hover:text-white transition-all text-[var(--admin-text-muted)]">
              View Public Site ↗
            </a>
          </div>
          <div className="max-w-7xl mx-auto p-4 md:p-8 pt-16 md:pt-8 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileAdminNav />
      </div>
    </AdminThemeProvider>
  );
}
