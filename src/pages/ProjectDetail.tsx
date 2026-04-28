import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase, Project } from '../lib/supabase';
import Badge from '../components/Badge';
import GlassCard from '../components/GlassCard';
import RelatedProjects from '../components/RelatedProjects';
import PortfolioDemoEmbed from '../components/admin/PortfolioDemoEmbed';
import { createRoot } from 'react-dom/client';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();
      setProject(data as Project);
      if (data) {
        document.title = `${data.title} — Ebubechukwu Nwagbara`;
      }
      setLoading(false);
    }
    loadProject();
  }, [slug]);

  useEffect(() => {
    if (!project) return;
    
    // Hydrate Portfolio Demo
    const demoContainers = document.querySelectorAll('[data-type="portfolio-demo"]');
    demoContainers.forEach(container => {
      if (container.getAttribute('data-hydrated')) return;
      container.setAttribute('data-hydrated', 'true');
      const root = createRoot(container);
      root.render(<PortfolioDemoEmbed />);
    });
  }, [project, project?.case_study_html]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center">Project not found</div>;

  return (
    <div className="bg-primary transition-colors min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Cinematic Header */}
        <div className="mb-16 space-y-8">
          <div className="relative w-full bg-white rounded-2xl overflow-hidden shadow-xl group flex items-center justify-center p-4 md:p-8 border border-border-default">
            {project.cover_image_url ? (
              <img 
                src={project.cover_image_url} 
                alt={project.title} 
                className="max-w-full h-auto object-contain transition-transform duration-1000 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center text-muted font-mono text-sm bg-surface">[ Project_Cover_Media ]</div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                {project.category_tags?.map((tag) => (
                <Badge key={tag} label={tag} />
                ))}
            </div>
            <h1 className="text-5xl md:text-7xl font-display text-primary tracking-tight leading-[1.1]">
                {project.title}
            </h1>
          </div>
        </div>

        {/* Overview */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-section font-display mb-6">The Challenge</h2>
            <p className="text-primary leading-relaxed">
              {project.short_description}
            </p>
          </div>
          <div>
            <h2 className="text-section font-display mb-6">Metadata</h2>
            <GlassCard>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Client:</span>
                  <span className="text-primary">{project.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Type:</span>
                  <span className="text-accent-blue">{project.type}</span>
                </div>
                {project.gis_metadata?.coordinate_system && (project.type !== 'Hybrid' || project.gis_metadata?.enabled) && (
                  <div className="flex justify-between">
                    <span className="text-secondary">CRS:</span>
                    <span className="text-primary">{project.gis_metadata.coordinate_system}</span>
                  </div>
                )}
                {project.gis_metadata?.data_points && (project.type !== 'Hybrid' || project.gis_metadata?.enabled) && (
                  <div className="flex justify-between">
                    <span className="text-secondary">Data Points:</span>
                    <span className="text-accent-lime">{project.gis_metadata.data_points}</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Media Gallery */}
        {project.media_gallery && project.media_gallery.length > 0 && (
          <div className="mb-20">
            <h2 className="text-section font-display mb-8">Project Gallery</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {project.media_gallery.slice(0, 6).map((media, i) => (
                <div
                  key={i}
                  className="aspect-video bg-surface border border-border-default rounded-xl overflow-hidden flex items-center justify-center text-muted font-mono text-sm"
                >
                  {media.url && (
                    <img src={media.url} alt={media.caption || `Gallery ${i}`} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Vault */}
        {(project.pdf_report_url || project.geojson_url) && (
          <div className="mb-20">
            <h2 className="text-section font-display mb-8">Technical Vault</h2>
            <GlassCard>
              <div className="space-y-4">
                {project.pdf_report_url && (
                  <a
                    href={project.pdf_report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-terminal-bg border border-terminal-border hover:border-accent-blue transition font-mono text-sm text-primary rounded-lg"
                  >
                    📄 Download PDF Report
                  </a>
                )}
                {project.geojson_url && (
                  <a
                    href={project.geojson_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-terminal-bg border border-terminal-border hover:border-accent-blue transition font-mono text-sm text-primary rounded-lg"
                  >
                    📍 Download GeoJSON Data
                  </a>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Case Study Content (Rich Text) */}
        {project.case_study_html && (
          <div className="mb-20">
            <div 
              className="case-study-content prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: project.case_study_html }}
            />
          </div>
        )}
        {/* Related Projects */}
        <RelatedProjects currentProject={project} />

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .case-study-content {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          line-height: 1.8;
          color: var(--text-primary);
        }

        .case-study-content h1 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          color: var(--text-primary);
          margin: 2.5rem 0 1rem;
          line-height: 1.2;
        }

        .case-study-content h2 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: clamp(1.375rem, 2.5vw, 1.875rem);
          color: var(--text-primary);
          margin: 2rem 0 0.875rem;
        }

        .case-study-content h3 {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--text-primary);
          margin: 1.75rem 0 0.75rem;
        }

        .case-study-content p {
          margin: 0 0 1.25rem;
          color: var(--text-secondary);
        }

        .case-study-content strong { color: var(--text-primary); font-weight: 600; }
        .case-study-content em    { font-style: italic; color: var(--text-secondary); }

        .case-study-content a {
          color: #2563EB;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .case-study-content a:hover { color: #1D4ED8; }

        .case-study-content blockquote {
          border-left: 3px solid #2563EB;
          background: var(--bg-glass);
          backdrop-filter: blur(8px);
          padding: 16px 24px;
          border-radius: 0 12px 12px 0;
          margin: 1.5rem 0;
          font-family: 'Poppins', sans-serif;
          font-style: italic;
          color: var(--text-secondary);
        }

        .case-study-content pre {
          background: var(--terminal-bg);
          color: #A3E635;
          padding: 20px 24px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid var(--terminal-border);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
        }

        .case-study-content code {
          background: var(--bg-surface);
          color: #A3E635;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85em;
          font-family: 'JetBrains Mono', monospace;
        }

        .case-study-content img {
          max-width: 100%;
          height: auto;
          border-radius: 16px;
          margin: 1.5rem 0;
          box-shadow: var(--shadow-elevated);
        }

        .case-study-content video {
          max-width: 100%;
          border-radius: 12px;
          margin: 1.5rem 0;
        }

        .case-study-content iframe {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--border-default);
          margin: 1.5rem 0;
        }

        .case-study-content ul,
        .case-study-content ol {
          padding-left: 1.5rem;
          margin: 0 0 1.25rem;
          color: var(--text-secondary);
        }

        .case-study-content li { margin-bottom: 0.5rem; }

        .case-study-content hr {
          border: none;
          border-top: 1px solid var(--border-default);
          margin: 2.5rem 0;
        }

        .portfolio-demo-container {
          margin: 3rem 0;
          width: 100%;
        }

        [data-theme="light"] .case-study-content pre { background: #F0F4F8; color: #166534; }
        [data-theme="light"] .case-study-content code { background: #F0F4F8; color: #166534; }
      `}} />
    </div>
  );
}
