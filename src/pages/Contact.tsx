import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import SectionEntrance from '../components/SectionEntrance';
import GlassCard from '../components/GlassCard';
import { Send, Terminal, Loader2, MessageSquare, AlertCircle, ChevronDown } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    service_interest: 'GIS Mapping',
    project_description: '',
    budget_range: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [auditInput, setAuditInput] = useState('');
  const [auditOutput, setAuditOutput] = useState('');
  const [c, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadContent() {
      const { data } = await supabase.from('page_content').select('section,field_key,field_value').eq('page', 'contact');
      if (data) {
        const cmap: Record<string, string> = {};
        data.forEach(r => {
          if (r.field_value) cmap[`${r.section}_${r.field_key}`] = r.field_value;
        });
        setContent(cmap);
      }
    }
    loadContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('client_enquiries').insert([formData]);
      setSubmitted(true);
      setFormData({ full_name: '', email: '', service_interest: 'GIS Mapping', project_description: '', budget_range: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    setSubmitting(false);
  };

  const runAudit = async () => {
    if (!auditInput.trim()) return;
    setAuditOutput('Establishing secure AI link...');
    try {
      const prompt = `You are an elite GIS auditor and Senior UX Architect. Review this project description: "${auditInput}". 
Identify 3 critical spatial or design risks and suggest 3 high-impact improvements. 
Format as a technical system report. Keep it concise, authoritative, and helpful.`;

      const { data, error } = await supabase.functions.invoke('ai-audit', {
        body: { prompt }
      });

      if (error) throw error;
      
      const auditResult = data.text || 'No response from AI node.';
      setAuditOutput(auditResult);
      
      // Log AI Audit interaction to enquiries table
      await supabase.from('client_enquiries').insert([{
        full_name: 'AI Audit User',
        email: 'ai-audit@system.local',
        service_interest: 'AI_AUDIT',
        project_description: `[AI AUDIT PROMPT]: ${auditInput}\n\n[AI RESPONSE PREVIEW]: ${auditResult.substring(0, 200)}...`,
      }]);
    } catch (error) {
      console.error('Audit failed:', error);
      setAuditOutput('Error: Unable to connect to AI Audit node. Ensure GEMINI_API_KEY is configured in Supabase Edge Function secrets.');
    }
  };

  return (
    <div className="bg-primary transition-colors min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionEntrance>
          <h1 className="text-section font-display mb-12">
            {c['contact_info_headline'] || 'Get In Touch'}
          </h1>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* Services */}
            <div>
              <h2 className="text-2xl font-display mb-8 flex items-center gap-3 text-primary">
                <MessageSquare className="text-accent-blue" size={24} />
                {c['services_section_title'] || 'Expertise & Offerings'}
              </h2>
              <div className="space-y-4">
                {[
                  { title: c['services_service_1_title'] || 'Spatial Analysis & GIS Mapping', desc: c['services_service_1_description'] || 'Transforming raw geodata into operational maps.' },
                  { title: c['services_service_2_title'] || 'UX Design & Prototyping', desc: c['services_service_2_description'] || 'Research-backed interfaces for complex tools.' },
                  { title: c['services_service_3_title'] || 'Automated Spatial Pipelines', desc: c['services_service_3_description'] || 'Building ModelBuilder and Python workflows.' },
                ].map((service) => (
                  <GlassCard key={service.title} className="hover:border-accent-blue transition-colors group">
                    <h3 className="font-heading font-bold mb-2 text-primary group-hover:text-accent-blue transition-colors">{service.title}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{service.desc}</p>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* AI Audit */}
            <div>
              <h2 className="text-2xl font-display mb-8 flex items-center gap-3 text-primary">
                <Terminal className="text-accent-lime" size={24} />
                {c['contact_info_audit_title'] || 'Interactive AI Audit'}
              </h2>
              <GlassCard className="relative overflow-hidden">
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-4">
                  {c['contact_info_audit_input_label'] || 'Describe your project or spatial challenge'}
                </label>
                <textarea
                  value={auditInput}
                  onChange={(e) => setAuditInput(e.target.value)}
                  className="w-full bg-surface border border-border-default rounded-xl p-4 text-sm text-primary font-mono focus:border-accent-blue focus:outline-none transition-all"
                  rows={4}
                  placeholder={c['contact_info_audit_placeholder'] || "e.g., I'm building a heat island map for Lagos..."}
                />
                <button
                  onClick={runAudit}
                  className="btn-primary mt-4 w-full justify-center group"
                >
                  {c['contact_info_audit_button_label'] || 'Generate Spatial Report'}
                  <Terminal size={16} className="ml-2 group-hover:rotate-12 transition-transform" />
                </button>
                {auditOutput && (
                  <div className="mt-6 p-4 bg-terminal-bg rounded-xl border border-border-default font-mono text-[11px] relative">
                    <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                        <span className="text-accent-lime flex items-center gap-1"><AlertCircle size={12}/> system.log</span>
                        <span className="text-muted tracking-tighter uppercase">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <p className="text-primary whitespace-pre-wrap leading-relaxed">{auditOutput}</p>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-display mb-4 text-primary">{c['contact_form_headline'] || 'Start a Collaboration'}</h2>
                <p className="text-secondary">{c['contact_form_subtext'] || 'Fill out the form below and I\'ll get back to you within 24 hours.'}</p>
            </div>

            <GlassCard className="relative">
              {submitted && (
                <div className="absolute inset-0 z-50 bg-surface/95 backdrop-blur-sm rounded-3xl flex items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-300">
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-accent-lime/20 text-accent-lime mx-auto flex items-center justify-center">
                            <Send size={32} />
                        </div>
                        <h3 className="text-2xl font-display text-primary">Transmission Received!</h3>
                        <p className="text-secondary max-w-xs">{c['contact_form_success_message'] || 'Thank you for reaching out. I will review your inquiry and respond shortly.'}</p>
                    </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Full Identity</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        placeholder="Ebube Chukwu"
                        className="w-full bg-surface border border-border-default rounded-xl p-4 text-primary focus:border-accent-blue focus:outline-none transition-all"
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Digital Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="ebube@example.com"
                        className="w-full bg-surface border border-border-default rounded-xl p-4 text-primary focus:border-accent-blue focus:outline-none transition-all"
                    />
                    </div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Service interest</label>
                  <div className="relative group">
                    <select
                      value={formData.service_interest}
                      onChange={(e) => setFormData({ ...formData, service_interest: e.target.value })}
                      className="w-full bg-surface border border-border-default rounded-xl p-4 text-primary focus:border-accent-blue focus:outline-none transition-all appearance-none cursor-pointer pr-12"
                    >
                      <option>GIS Mapping</option>
                      <option>UX Design</option>
                      <option>Spatial Pipeline</option>
                      <option>Consultation</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted group-focus-within:text-accent-blue transition-colors">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Project Brief</label>
                  <textarea
                    value={formData.project_description}
                    onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                    required
                    placeholder="Briefly describe your goals, constraints, and timeline..."
                    className="w-full bg-surface border border-border-default rounded-xl p-4 text-primary focus:border-accent-blue focus:outline-none transition-all leading-relaxed"
                    rows={5}
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-4 text-lg">
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : <Send size={20} className="mr-2" />}
                  {submitting ? 'Transmitting...' : (c['contact_form_button_label'] || 'Initiate Contact')}
                </button>
              </form>
            </GlassCard>
          </div>
        </SectionEntrance>
      </div>
    </div>
  );
}
