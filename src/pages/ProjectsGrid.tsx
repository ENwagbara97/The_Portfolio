import { useState, useEffect } from 'react';
import { supabase, Project } from '../lib/supabase';
import SectionEntrance from '../components/SectionEntrance';
import Badge from '../components/Badge';

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function loadProjects() {
      let query = supabase.from('projects').select('*').eq('is_active', true);
      if (filter !== 'All') query = query.eq('type', filter);
      const { data } = await query.order('display_order');
      if (data) setProjects(data);
    }
    loadProjects();
  }, [filter]);

  const types = ['All', 'GIS', 'UX', 'Hybrid'];

  return (
    <div className="bg-primary transition-colors min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionEntrance>
          <h1 className="text-section font-display mb-12">All Projects</h1>

          <div className="flex gap-3 mb-12 flex-wrap">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full font-heading text-sm transition ${
                  filter === type
                    ? 'bg-accent-blue text-white'
                    : 'bg-surface border border-border-default text-secondary hover:border-border-active'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <a
                key={proj.id}
                href={`/projects/${proj.slug}`}
                className="group card-hover rounded-xl overflow-hidden bg-card-bg border border-card-border"
              >
                <div className="aspect-video bg-white border-b border-border-default flex items-center justify-center text-muted font-mono text-sm overflow-hidden p-2">
                  {proj.cover_image_url && (
                    <img src={proj.cover_image_url} alt={proj.title} loading="lazy" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold mb-2 group-hover:text-accent-blue transition text-primary">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-secondary mb-4 line-clamp-2">{proj.short_description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {proj.category_tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} label={tag} />
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </SectionEntrance>
      </div>
    </div>
  );
}
