import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Project } from '../lib/types';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Badge from './Badge';

interface RelatedProjectsProps {
  currentProject: Project;
}

export default function RelatedProjects({ currentProject }: RelatedProjectsProps) {
  const [related, setRelated] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      // 1. Fetch same type
      let { data: projects } = await supabase
        .from('projects')
        .select('id, title, slug, type, category_tags, cover_image_url, short_description')
        .eq('type', currentProject.type)
        .eq('is_active', true)
        .neq('slug', currentProject.slug)
        .order('display_order', { ascending: true })
        .limit(4);

      let results = projects || [];

      // 2. If fewer than 3, backfill with Hybrid projects (if current is not Hybrid)
      if (results.length < 3 && currentProject.type !== 'Hybrid') {
        const { data: hybrid } = await supabase
          .from('projects')
          .select('id, title, slug, type, category_tags, cover_image_url, short_description')
          .eq('type', 'Hybrid')
          .eq('is_active', true)
          .neq('slug', currentProject.slug)
          .limit(3 - results.length);
        
        if (hybrid) {
          // Avoid duplicates
          const existingIds = new Set(results.map(p => p.id));
          results = [...results, ...hybrid.filter(p => !existingIds.has(p.id))];
        }
      }

      setRelated(results.slice(0, 4));
      setLoading(false);
    }

    fetchRelated();
  }, [currentProject]);

  if (loading || related.length === 0) return null;

  const categoryLabel = currentProject.type === 'GIS' ? 'GIS Projects' : currentProject.type === 'UX' ? 'UX Projects' : 'Related Projects';

  return (
    <section className="pt-20 border-t border-[var(--border-default)]">
      <div className="flex justify-between items-end mb-10">
        <h2 className="text-3xl font-display text-primary">
          More <span className="text-[#2563EB]">{categoryLabel}</span>
        </h2>
        <Link 
          to="/projects" 
          className="flex items-center gap-2 text-sm font-heading font-medium text-[#2563EB] hover:underline"
        >
          View All Projects <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 sm:overflow-visible snap-x snap-mandatory">
        {related.map((project) => (
          <Link 
            key={project.id} 
            to={`/projects/${project.slug}`}
            className="group block bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#2563EB]/50 transition-all duration-300 hover:-translate-y-2 snap-center min-w-[280px] sm:min-w-0"
          >
            {/* Cover */}
            <div className="aspect-[16/9] overflow-hidden">
              {project.cover_image_url ? (
                <img 
                  src={project.cover_image_url} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-[var(--admin-input-bg)] flex items-center justify-center text-muted font-mono text-xs">
                  NO_COVER
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <div className="flex flex-wrap gap-1">
                {project.category_tags?.slice(0, 2).map(tag => (
                  <Badge key={tag} label={tag} className="!text-[10px] !py-0.5" />
                ))}
              </div>
              
              <h3 className="font-heading font-semibold text-primary leading-tight line-clamp-2 min-h-[2.5rem]">
                {project.title}
              </h3>
              
              <p className="text-xs text-secondary line-clamp-2 leading-relaxed h-8">
                {project.short_description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-default)]">
                <span className="text-xs font-heading font-medium text-[#2563EB]">View Project</span>
                <ArrowUpRight size={14} className="text-[#2563EB]" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
