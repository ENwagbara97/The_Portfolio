import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/GlassCard';
import { ArrowLeft } from 'lucide-react';

interface ContentField {
  field_key: string;
  field_value: string;
  field_type: string;
}

const SECTIONS = [
  { page: 'HOME', items: ['hero', 'stats', 'featured_work', 'testimonials', 'cta_banner', 'nav'] },
  { page: 'CONTACT', items: ['services', 'contact_info', 'contact_form'] },
  { page: 'FOOTER', items: ['footer'] },
  { page: 'GLOBAL', items: ['global'] },
];

export default function ContentManager() {
  const { user, loading } = useAuth();
  const [selectedSection, setSelectedSection] = useState('home_hero');
  const [fields, setFields] = useState<ContentField[]>([]);
  const [initialFields, setInitialFields] = useState<ContentField[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sectionLoading, setSectionLoading] = useState(false);

  // FIX 3: Align data to sections on mount
  useEffect(() => {
    async function alignData() {
      if (!user) return;
      const alignMap = [
        { match: 'hero_', target: 'hero' },
        { match: 'terminal_', target: 'hero' },
        { match: 'stats_', target: 'stats' }
      ];
      for (const item of alignMap) {
        await supabase
          .from('page_content')
          .update({ section: item.target })
          .filter('field_key', 'ilike', `${item.match}%`)
          .eq('page', 'home');
      }
      loadSection();
    }
    alignData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadSection();
  }, [selectedSection, user]);

  async function loadSection() {
    setFields([]);
    setSectionLoading(true);
    const [page, section] = selectedSection.split('_');
    const { data } = await supabase
      .from('page_content')
      .select('field_key, field_value, field_type')
      .eq('page', page)
      .eq('section', section)
      .order('field_key');

    let fetchedFields = (data || []) as ContentField[];

    // Self-Healing Injection for Dummy Content
    const DUMMY_DATA: Record<string, ContentField[]> = {
      'home_hero': [
        { field_key: 'terminal_line_1', field_value: 'status: available_for_hire', field_type: 'text' },
        { field_key: 'terminal_line_2', field_value: 'location: Port_Harcourt, NG', field_type: 'text' },
        { field_key: 'terminal_line_3', field_value: 'expertise: [GIS, UX_Design, Spatial_Systems]', field_type: 'text' },
        { field_key: 'terminal_line_4', field_value: 'focus: Humanizing_Geospatial_Data', field_type: 'text' },
        { field_key: 'terminal_prompt', field_value: 'ebube@cartographer ~ $', field_type: 'text' },
        { field_key: 'hero_headline_part1', field_value: 'Cartographer of Systems.', field_type: 'text' },
        { field_key: 'hero_headline_part2', field_value: 'Architect of Experiences.', field_type: 'text' },
        { field_key: 'hero_subtext', field_value: 'I build geospatial intelligence tools and human-centered digital products — merging spatial science with interaction design.', field_type: 'textarea' },
        { field_key: 'hero_cta_primary_label', field_value: 'View My Work', field_type: 'text' },
        { field_key: 'hero_cta_secondary_label', field_value: 'Download CV', field_type: 'text' },
        { field_key: 'hero_pill_1', field_value: 'ArcGIS Pro · Python · React', field_type: 'text' },
        { field_key: 'hero_pill_2', field_value: 'GIS + UX Design', field_type: 'text' },
        { field_key: 'hero_pill_3', field_value: 'Port Harcourt, NG', field_type: 'text' }
      ],
      'home_stats': [
        { field_key: 'stats_stat_1_label', field_value: 'Years of Spatial Analysis', field_type: 'text' },
        { field_key: 'stats_stat_1_value', field_value: '5', field_type: 'number' },
        { field_key: 'stats_stat_2_label', field_value: 'GIS & UX Projects', field_type: 'text' },
        { field_key: 'stats_stat_2_value', field_value: '10', field_type: 'number' },
        { field_key: 'stats_stat_3_label', field_value: 'Technical Tools', field_type: 'text' },
        { field_key: 'stats_stat_3_value', field_value: '4', field_type: 'number' },
        { field_key: 'stats_stat_4_label', field_value: 'Portfolio Quality', field_type: 'text' },
        { field_key: 'stats_stat_4_value', field_value: '100', field_type: 'number' },
        { field_key: 'stats_stat_4_suffix', field_value: '%', field_type: 'text' }
      ],
      'home_featured_work': [
        { field_key: 'featured_work_section_title', field_value: 'Featured Work', field_type: 'text' },
        { field_key: 'featured_work_view_all_label', field_value: 'Explore All Projects', field_type: 'text' }
      ],
      'home_testimonials': [
        { field_key: 'testimonials_section_title', field_value: 'Testimonials', field_type: 'text' }
      ],
      'home_cta_banner': [
        { field_key: 'cta_banner_headline', field_value: 'Ready to Work Together?', field_type: 'text' },
        { field_key: 'cta_banner_subtext', field_value: 'I\'m available for new projects, consultations, and collaboration opportunities.', field_type: 'textarea' },
        { field_key: 'cta_banner_button_label', field_value: 'Get in Touch', field_type: 'text' }
      ],
      'home_nav': [
        { field_key: 'live_status_text', field_value: 'Live Status', field_type: 'text' }
      ],
      'contact_services': [
        { field_key: 'services_section_title', field_value: 'Expertise & Offerings', field_type: 'text' },
        { field_key: 'services_service_1_title', field_value: 'Spatial Analysis & GIS Mapping', field_type: 'text' },
        { field_key: 'services_service_1_description', field_value: 'Transforming raw geodata into operational maps.', field_type: 'textarea' },
        { field_key: 'services_service_2_title', field_value: 'UX Design & Prototyping', field_type: 'text' },
        { field_key: 'services_service_2_description', field_value: 'Research-backed interfaces for complex tools.', field_type: 'textarea' },
        { field_key: 'services_service_3_title', field_value: 'Automated Spatial Pipelines', field_type: 'text' },
        { field_key: 'services_service_3_description', field_value: 'Building ModelBuilder and Python workflows.', field_type: 'textarea' }
      ],
      'contact_contact_info': [
        { field_key: 'contact_info_headline', field_value: 'Get In Touch', field_type: 'text' },
        { field_key: 'contact_info_audit_title', field_value: 'Interactive AI Audit', field_type: 'text' },
        { field_key: 'contact_info_audit_input_label', field_value: 'Describe your project or spatial challenge', field_type: 'text' },
        { field_key: 'contact_info_audit_placeholder', field_value: 'e.g., I\'m building a heat island map for Lagos...', field_type: 'text' },
        { field_key: 'contact_info_audit_button_label', field_value: 'Generate Spatial Report', field_type: 'text' }
      ],
      'contact_contact_form': [
        { field_key: 'contact_form_headline', field_value: 'Start a Collaboration', field_type: 'text' },
        { field_key: 'contact_form_subtext', field_value: 'Fill out the form below and I\'ll get back to you within 24 hours.', field_type: 'textarea' },
        { field_key: 'contact_form_success_message', field_value: 'Thank you for reaching out. I will review your inquiry and respond shortly.', field_type: 'textarea' },
        { field_key: 'contact_form_button_label', field_value: 'Initiate Contact', field_type: 'text' }
      ],
      'footer_footer': [
        { field_key: 'bio_tagline', field_value: 'Cartographer of Systems. Architect of Experiences. Mapping the gap between spatial data and human interaction.', field_type: 'textarea' },
        { field_key: 'copyright_text', field_value: '© 2026 Ebubechukwu Nwagbara. All rights reserved.', field_type: 'text' }
      ]
    };

    const requiredFields = DUMMY_DATA[selectedSection] || [];
    for (const req of requiredFields) {
      if (!fetchedFields.some(f => f.field_key === req.field_key)) {
        fetchedFields.push(req);
      }
    }

    setFields(fetchedFields);
    setInitialFields(JSON.parse(JSON.stringify(fetchedFields))); 
    setSectionLoading(false);
  }

  const isDirty = JSON.stringify(fields) !== JSON.stringify(initialFields);

  async function saveSection() {
    setSaving(true);
    setErrorMsg(null);
    const [page, section] = selectedSection.split('_');
    
    const upsertData = fields.map(field => ({
      page,
      section,
      field_key: field.field_key,
      field_value: field.field_value,
      field_type: field.field_type
    }));

    const { error } = await supabase
      .from('page_content')
      .upsert(upsertData, { onConflict: 'page,section,field_key' });

    if (!error) {
      setInitialFields(JSON.parse(JSON.stringify(fields)));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setErrorMsg(`Save failed: ${error.message}`);
      setTimeout(() => setErrorMsg(null), 5000);
    }
    setSaving(false);
  }

  const updateField = (key: string, value: string) => {
    setFields(fields.map(f => f.field_key === key ? { ...f, field_value: value } : f));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono">/ initializing_cms...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Link to="/console" className="inline-flex items-center gap-2 text-xs font-mono text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors bg-[var(--admin-card)] px-4 py-2 rounded-full border border-[var(--admin-border)] md:bg-transparent md:border-none md:p-0">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-[var(--admin-accent)]" />
            <h1 className="text-lg font-display text-[var(--admin-text)]">Content Manager</h1>
          </div>
          
          <div className="space-y-4">
            {SECTIONS.map(s => (
              <div key={s.page} className="space-y-1">
                <p className="text-[10px] font-mono tracking-widest text-[var(--admin-text-muted)] uppercase px-3 py-1">
                  {s.page}
                </p>
                {s.items.map(item => {
                  const id = `${s.page.toLowerCase()}_${item}`;
                  const isActive = selectedSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedSection(id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${
                        isActive 
                          ? 'text-[var(--admin-accent)] border border-[color-mix(in srgb,var(--admin-accent),transparent_80%)]' 
                          : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] border border-transparent'
                      }`}
                      style={{ backgroundColor: isActive ? 'color-mix(in srgb, var(--admin-accent), transparent 90%)' : 'transparent' }}
                    >
                      <span className="capitalize">{item.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        {isDirty && isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                        )}
                        <span className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-[var(--admin-accent)]' : 'text-[var(--admin-text-muted)]'}`}>
                          →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Main Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--admin-text-muted)]">
              <span>ADMIN</span>
              <span>/</span>
              <span>{selectedSection.split('_')[0].toUpperCase()}</span>
              <span>/</span>
              <span className="text-[var(--admin-text)]">{selectedSection.split('_').slice(1).join('_').replace(/_/g, ' ')}</span>
            </div>
            {isDirty && (
              <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                UNSAVED_CHANGES.txt
              </span>
            )}
          </div>

          <GlassCard className="relative min-h-[500px] flex flex-col !bg-[var(--admin-card)] !border-[var(--admin-border)]">
            {saved && (
              <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-2 z-10">
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-full text-xs font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Section saved successfully
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-2 z-10">
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 max-w-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errorMsg}
                </div>
              </div>
            )}

            <div className="p-2 flex-1">
              {sectionLoading ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-[var(--admin-text-muted)] font-mono animate-pulse">
                  <div className="w-8 h-8 border-2 border-[var(--admin-accent)]/20 border-t-[var(--admin-accent)] rounded-full animate-spin mb-4" />
                  <p className="text-[10px] tracking-widest uppercase">Fetching_Section_Data...</p>
                </div>
              ) : fields.length > 0 ? (
                <div className="space-y-8">
                  {/* FIX 4: Split fields into Main and Terminal for Hero */}
                  {(() => {
                    const heroFilter = (field: ContentField) => {
                      if (selectedSection !== 'home_hero') return true;
                      return (
                        field.field_key.includes('headline') ||
                        field.field_key.includes('cta') ||
                        field.field_key.includes('terminal') ||
                        field.field_key.includes('subtext') ||
                        field.field_key.includes('pill')
                      );
                    };

                    const filtered = fields.filter(heroFilter);
                    const mainFields = filtered.filter(f => !f.field_key.includes('terminal'));
                    const terminalFields = filtered.filter(f => f.field_key.includes('terminal'));

                    const renderField = (field: ContentField) => {
                      const labels: Record<string, string> = {
                        'hero_headline_part1': 'Hero Headline — Line 1',
                        'hero_headline_part2': 'Hero Headline — Line 2',
                        'hero_subtext': 'Hero Sub-Headline / Description',
                        'hero_cta_primary_label': 'Primary CTA Button Label',
                        'hero_cta_secondary_label': 'Secondary CTA Button Label',
                        'terminal_prompt': 'Terminal — Prompt Text',
                        'terminal_line_1': 'Terminal — Line 1 (Status)',
                        'terminal_line_2': 'Terminal — Line 2 (Location)',
                        'terminal_line_3': 'Terminal — Line 3 (Expertise)',
                        'terminal_line_4': 'Terminal — Line 4 (Focus)',
                        'hero_pill_1': 'Skill Pillar 1',
                        'hero_pill_2': 'Skill Pillar 2',
                        'hero_pill_3': 'Skill Pillar 3',
                      };
                      const label = labels[field.field_key] || field.field_key.replace(/_/g, ' ');

                      return (
                        <div key={field.field_key} className="group">
                          <label className="block text-[11px] font-mono text-[var(--admin-text-muted)] mb-2 tracking-wide uppercase transition-colors group-focus-within:text-[var(--admin-accent)] font-bold">
                            {label}
                            <span className="ml-1 opacity-40 font-normal">[{field.field_type}]</span>
                          </label>
                          
                          {field.field_type === 'textarea' ? (
                            <textarea
                              value={field.field_value || ''}
                              onChange={e => updateField(field.field_key, e.target.value)}
                              className="w-full rounded-xl p-4 text-sm font-sans focus:outline-none transition-all placeholder:text-[var(--admin-text-muted)]/40"
                              rows={3}
                              style={{
                                background: 'var(--admin-input-bg)',
                                border: '1px solid var(--admin-border)',
                                color: 'var(--admin-text)',
                              }}
                              placeholder={`Enter ${label}...`}
                            />
                          ) : (
                            <input
                              type={field.field_type === 'number' ? 'number' : field.field_type === 'url' ? 'url' : 'text'}
                              value={field.field_value || ''}
                              onChange={e => updateField(field.field_key, e.target.value)}
                              className="w-full rounded-xl p-4 text-sm font-sans focus:outline-none transition-all placeholder:text-[var(--admin-text-muted)]/40"
                              style={{
                                background: 'var(--admin-input-bg)',
                                border: '1px solid var(--admin-border)',
                                color: 'var(--admin-text)',
                              }}
                              placeholder={`Enter ${label}...`}
                            />
                          )}
                        </div>
                      );
                    };

                    return (
                      <>
                        {selectedSection === 'home_hero' ? (
                          <>
                            {mainFields.map(renderField)}
                            
                            {terminalFields.length > 0 && (
                              <div className="pt-8 border-t border-[var(--admin-border)] mt-12 pb-4">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="px-2 py-1 rounded text-[10px] font-mono tracking-tighter border"
                                       style={{ backgroundColor: 'color-mix(in srgb, var(--admin-accent), transparent 90%)', color: 'var(--admin-accent)', borderColor: 'color-mix(in srgb, var(--admin-accent), transparent 80%)' }}>
                                    HERO_COMPONENT_02
                                  </div>
                                  <h3 className="text-sm font-display text-[var(--admin-text)] uppercase tracking-wider">Terminal Hero Settings</h3>
                                </div>
                                <div className="space-y-8">
                                  {terminalFields.sort((a,b) => {
                                    if (a.field_key.includes('prompt')) return -1;
                                    if (b.field_key.includes('prompt')) return 1;
                                    return a.field_key.localeCompare(b.field_key);
                                  }).map(renderField)}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          filtered.map(renderField)
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted font-mono text-sm italic">
                  No editable fields found in this section.
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-[var(--admin-border)] flex justify-end">
              <button
                onClick={saveSection}
                disabled={!isDirty || saving}
                className="px-12 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed group transition-all"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}
              >
                <div className="flex items-center gap-2">
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Update Section</span>
                  )}
                </div>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
