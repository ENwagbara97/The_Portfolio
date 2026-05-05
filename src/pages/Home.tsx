import { useState, useEffect, Component, ErrorInfo, ReactNode, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { supabase, Project, Testimonial } from '../lib/supabase';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import SectionEntrance from '../components/SectionEntrance';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import { TerminalWindow } from '../components/ui/TerminalWindow';
import TestimonialCarousel from '../components/ui/TestimonialCarousel';

const ThreeGlobe = lazy(() => import('../components/ThreeGlobe'));

// Simple Error Boundary to catch render-time issues
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4 text-center">
          <div className="font-mono max-w-lg bg-surface p-8 rounded-2xl border border-red-500/20 shadow-xl">
            <h2 className="text-red-500 font-bold mb-4 uppercase tracking-widest text-xs">/ system_rendering_failure.log</h2>
            <p className="text-secondary text-xs mb-6 opacity-80 leading-relaxed">
              A high-level rendering exception occurred while assembling the geospatial interface.
            </p>
            <div className="text-[10px] text-muted p-3 bg-primary rounded border border-border-default mb-6 text-left break-all">
              {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary !py-2 !px-4 text-[10px] uppercase tracking-widest"
            >
              Force System Reboot
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [c, setContent] = useState<Record<string, string>>({});
  const [activeCvUrl, setActiveCvUrl] = useState<string | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe parseInt helper for stats
  const getSafeStat = (key: string, fallback: number) => {
    const val = parseInt(c[key]);
    return isNaN(val) ? fallback : val;
  };

  const yearsCount = useAnimatedCounter(getSafeStat('stats_stat_1_value', 5), 1500, statsVisible);
  const projectsCount = useAnimatedCounter(getSafeStat('stats_stat_2_value', 10), 1500, statsVisible);
  const toolsCount = useAnimatedCounter(getSafeStat('stats_stat_3_value', 4), 1500, statsVisible);
  const qualityCount = useAnimatedCounter(getSafeStat('stats_stat_4_value', 100), 1500, statsVisible);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [projRes, testRes, contentRes, cvRes] = await Promise.all([
          supabase.from('projects').select('*').eq('is_active', true).order('display_order'),
          supabase.from('testimonials').select('*').eq('is_published', true).order('display_order'),
          supabase.from('page_content').select('section,field_key,field_value').eq('page', 'home'),
          supabase.from('cv_uploads').select('file_url').eq('is_active', true).limit(1)
        ]);

        if (projRes.error) throw projRes.error;
        if (testRes.error) throw testRes.error;
        if (contentRes.error) throw contentRes.error;

        if (projRes.data) setProjects(projRes.data);
        if (testRes.data) setTestimonials(testRes.data);
        
        if (contentRes.data) {
          const cmap: Record<string, string> = {};
          contentRes.data.forEach(r => {
            if (r.field_value) cmap[`${r.section}_${r.field_key}`] = r.field_value;
          });
          setContent(cmap);
          console.log('[CMS] Content Loaded:', cmap);
        }

        if (cvRes.data && cvRes.data[0]) {
          setActiveCvUrl(cvRes.data[0].file_url);
        }
      } catch (err: any) {
        console.error('[CMS] Error loading home data:', err);
        setError(err.message || 'Failed to initialize application.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);
  if (isLoading && !error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin mx-auto mb-4 shadow-[0_0_15px_rgba(37,99,235,0.2)]" />
          <p className="text-[10px] text-muted tracking-widest uppercase">/ initializing_spatial_systems...</p>
        </div>
      </div>
    );
  }


  const terminalData = [
    c['terminal_line_1'] ?? 'status: available_for_hire',
    c['terminal_line_2'] ?? 'location: Port_Harcourt, NG',
    c['terminal_line_3'] ?? 'expertise: [GIS, UX_Design, Spatial_Systems]',
    c['terminal_line_4'] ?? 'focus: Humanizing_Geospatial_Data',
  ];

  return (
    <ErrorBoundary>
      <div className="bg-primary transition-colors">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          <SectionEntrance>
            <TerminalWindow lines={terminalData} prompt={c['terminal_prompt']} />
            <h1 className="text-hero font-display mt-8 mb-6">
              {c['hero_headline_part1'] || 'Cartographer of Systems.'}
              <br />
              {c['hero_headline_part2'] || 'Architect of Experiences.'}
            </h1>
            <p className="text-lg text-secondary mb-8 leading-relaxed max-w-xl">
              {c['hero_subtext'] || 'I build geospatial intelligence tools and human-centered digital products — merging spatial science with interaction design.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a href="/projects" className="btn-primary justify-center sm:justify-start">
                {c['hero_cta_primary_label'] || 'View My Work'}
                <ArrowUpRight size={18} />
              </a>
              {activeCvUrl ? (
                <a href={activeCvUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-center sm:justify-start">
                  {c['hero_cta_secondary_label'] || 'Download CV'}
                </a>
              ) : (
                <button disabled className="btn-ghost opacity-50 cursor-not-allowed justify-center sm:justify-start">
                  CV Unavailable
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                c['hero_pill_1'] || 'ArcGIS Pro · Python · React',
                c['hero_pill_2'] || 'GIS + UX Design',
                c['hero_pill_3'] || 'Port Harcourt, NG'
              ].map((pill, i) => (
                <GlassCard key={i} className="!p-2 !bg-transparent border-border-active">
                  <span className="text-xs font-mono text-terminal">
                    {pill ?? ''}
                  </span>
                </GlassCard>
              ))}
            </div>
          </SectionEntrance>

          <SectionEntrance className="w-full mt-8 md:mt-0">
            <div className="w-full aspect-square relative rounded-3xl overflow-hidden border border-accent-blue/20 bg-[#050b15] shadow-[0_0_60px_rgba(37,99,235,0.15)]">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-[#050b15]">
                  <Loader2 className="animate-spin text-accent-blue" size={32} />
                </div>
              }>
                <ThreeGlobe />
              </Suspense>
              {/* Theme-aware label — uses CSS vars so it switches with light/dark mode */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md border text-[10px] font-mono uppercase tracking-widest"
                  style={{
                    backgroundColor: 'var(--bg-glass)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-lime animate-pulse flex-shrink-0" />
                  Interactive_GIS_Module_Active
                </div>
                <div
                  className="text-[9px] font-mono uppercase tracking-wider px-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  LIVE
                </div>
              </div>
            </div>
          </SectionEntrance>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <SectionEntrance>
          <h2 className="text-section font-display mb-12">
            {c['featured_work_section_title'] || 'Featured Work'}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {(projects ?? []).slice(0, 4).map((proj) => (
              <a
                key={proj.id}
                href={`/projects/${proj.slug}`}
                className="group card-hover rounded-xl overflow-hidden bg-card-bg border border-card-border"
              >
                <div className="aspect-video bg-white border-b border-border-default flex items-center justify-center text-muted font-mono text-sm overflow-hidden p-2">
                  {proj.cover_image_url ? (
                    <img src={proj.cover_image_url} alt={proj.title} loading="lazy" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    '[Project Cover]'
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold mb-2 group-hover:text-accent-blue transition text-primary">{proj.title ?? ''}</h3>
                  <p className="text-sm text-secondary mb-4 line-clamp-2">{proj.short_description ?? ''}</p>
                  <div className="flex gap-2 flex-wrap">
                    {(proj.category_tags ?? []).slice(0, 3).map((tag) => (
                      <Badge key={tag} label={tag} />
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href="/projects" className="btn-primary">
              {c['featured_work_view_all_label'] || 'Explore All Projects'}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </SectionEntrance>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          onViewportEnter={() => setStatsVisible(true)}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: c['stats_stat_1_label'] || 'Years of Spatial Analysis', value: yearsCount, suffix: '+' },
              { label: c['stats_stat_2_label'] || 'GIS & UX Projects', value: projectsCount, suffix: '+' },
              { label: c['stats_stat_3_label'] || 'Technical Tools', value: toolsCount, suffix: '' },
              { label: c['stats_stat_4_label'] || 'Portfolio Quality', value: qualityCount, suffix: c['stats_stat_4_suffix'] || '%' },
            ].map((stat, i) => (
              <GlassCard key={i} className="text-center group hover:border-accent-blue transition-colors">
                <div className="text-4xl font-bold text-accent-blue mb-2 group-hover:scale-110 transition-transform">
                  {stat.value ?? 0}{stat.suffix ?? ''}
                </div>
                <p className="text-xs font-heading text-secondary">{stat.label ?? ''}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <SectionEntrance>
          <h2 className="text-section font-display mb-12">
            {c['testimonials_section_title'] || 'Testimonials'}
          </h2>
          <TestimonialCarousel testimonials={testimonials ?? []} />
        </SectionEntrance>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto" id="contact">
        <SectionEntrance>
          <div
            className="rounded-3xl p-12 text-center border mt-8 bg-light-zone border-border-default relative overflow-hidden group"
          >
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-display mb-6 text-primary">{c['cta_banner_headline'] || 'Ready to Work Together?'}</h2>
                <p className="text-secondary mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {c['cta_banner_subtext'] || 'I\'m available for new projects, consultations, and collaboration opportunities.'}
                </p>
                <a href="/contact" className="btn-primary !px-8 !py-4 text-lg">
                {c['cta_banner_button_label'] || 'Get in Touch'}
                <ArrowUpRight size={22} />
                </a>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-accent-lime/5 rounded-full blur-3xl" />
          </div>
        </SectionEntrance>
      </section>
    </div>
    </ErrorBoundary>
  );
}

