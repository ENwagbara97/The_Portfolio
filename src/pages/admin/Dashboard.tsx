import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/GlassCard';
import { FileText, Briefcase, MessageSquare, ClipboardList, Settings, Image as ImageIcon, ArrowRight, Globe } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, enquiries: 0, unread: 0, testimonials: 0, gisNodes: 0 });

  useEffect(() => {
    async function loadStats() {
      const [pRes, eRes, uRes, tRes, gRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('client_enquiries').select('id', { count: 'exact' }),
        supabase.from('client_enquiries').select('id', { count: 'exact' }).eq('read_by_admin', false),
        supabase.from('testimonials').select('id', { count: 'exact' }),
        supabase.from('gis_folders').select('id', { count: 'exact' }),
      ]);
      setStats({
        projects: pRes.count || 0,
        enquiries: eRes.count || 0,
        unread: uRes.count || 0,
        testimonials: tRes.count || 0,
        gisNodes: gRes.count || 0,
      });
    }
    if (user) loadStats();
  }, [user]);

  const quickLinks = [
    { label: 'Content Manager', href: '/console/content', icon: FileText, desc: 'Edit page text & sections' },
    { label: 'Project Manager', href: '/console/projects', icon: Briefcase, desc: 'Add, edit, or reorder projects' },
    { label: 'GIS Lab Manager', href: '/console/gis-lab', icon: Globe, desc: 'Manage 3D Globe data nodes' },
    { label: 'Enquiries', href: '/console/enquiries', icon: ClipboardList, desc: 'View incoming contact requests' },
    { label: 'Testimonials', href: '/console/testimonials', icon: MessageSquare, desc: 'Manage client quotes' },
    { label: 'Media Library', href: '/console/media', icon: ImageIcon, desc: 'Browse uploaded assets' },
    { label: 'Site Settings', href: '/console/settings', icon: Settings, desc: 'Brand, socials & technical' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-display text-[var(--admin-text)]">Welcome Back</h1>
        <p className="text-[var(--admin-text-muted)] text-sm">System overview and quick access to all management modules.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Projects', value: stats.projects, color: 'text-accent-blue', path: '/console/projects' },
          { label: 'GIS Nodes', value: stats.gisNodes, color: 'text-accent-lime', path: '/console/gis-lab' },
          { label: 'Enquiries', value: stats.enquiries, color: 'text-accent-blue', path: '/console/enquiries' },
          { label: 'Unread', value: stats.unread, color: stats.unread > 0 ? 'text-amber-400' : 'text-accent-lime', path: '/console/enquiries' },
          { label: 'Testimonials', value: stats.testimonials, color: 'text-accent-blue', path: '/console/testimonials' },
        ].map((card) => (
          <Link key={card.label} to={card.path}>
            <GlassCard className="!bg-[var(--admin-card)] !border-[var(--admin-border)] hover:border-[var(--admin-accent)] transition-all cursor-pointer group h-full">
              <div className="text-center space-y-1 py-4">
                <p className={`text-3xl font-bold ${card.color} group-hover:scale-110 transition-transform`}>{card.value}</p>
                <p className="text-[9px] font-mono text-[var(--admin-text-muted)] uppercase tracking-widest">{card.label}</p>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)] mb-4">Quick Access</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="group p-5 rounded-2xl transition-all flex items-center gap-4 border border-[var(--admin-border)] bg-[var(--admin-surface)] hover:border-[var(--admin-accent)] shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue group-hover:bg-accent-blue group-hover:text-white transition-all shrink-0">
                <link.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm text-[var(--admin-text)]">{link.label}</p>
                <p className="text-[10px] text-[var(--admin-text-muted)] truncate">{link.desc}</p>
              </div>
              <ArrowRight size={16} className="text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

