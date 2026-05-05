import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Lock, 
  Play, 
  Globe, 
  Terminal, 
  Cpu, 
  LayoutDashboard, 
  Type, 
  Moon, 
  Sun, 
  Copy, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Map,
  Volume2,
  VolumeX
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- DATA TYPES & CONSTANTS ---

const VIDEO_CHAPTERS = [
  { id: 'hero',     label: 'Homepage Hero',         startTime: 0,   endTime: 18  },
  { id: 'projects', label: 'Projects Grid',          startTime: 18,  endTime: 35  },
  { id: 'gis',      label: 'GIS Lab + 3D Globe',     startTime: 35,  endTime: 55  },
  { id: 'contact',  label: 'AI Spatial Audit',       startTime: 55,  endTime: 70  },
  { id: 'theme',    label: 'Dark / Light Mode',      startTime: 70,  endTime: 82  },
  { id: 'admin',    label: 'Admin CMS Dashboard',    startTime: 82,  endTime: 110 },
  { id: 'editor',   label: 'Rich Text Editor',       startTime: 110, endTime: 130 },
];

const HOTSPOTS = [
  {
    id: 'terminal',
    triggerTime: 4,
    position: { top: '28%', left: '22%' },
    title: 'Live Terminal',
    description: 'Status lines are editable from the admin Content Manager. Changes reflect instantly.',
    icon: Terminal,
  },
  {
    id: 'globe',
    triggerTime: 38,
    position: { top: '40%', left: '60%' },
    title: '3D Interactive Globe',
    description: 'Three.js globe — drag to rotate, scroll to zoom, touch-enabled on mobile.',
    icon: Globe,
  },
  {
    id: 'ai-audit',
    triggerTime: 58,
    position: { top: '50%', left: '45%' },
    title: 'AI Spatial Audit',
    description: 'Powered by Anthropic Claude. Analyses project descriptions and returns GIS methodology recommendations.',
    icon: Cpu,
  },
  {
    id: 'admin-cms',
    triggerTime: 85,
    position: { top: '30%', left: '30%' },
    title: 'WordPress-Style CMS',
    description: 'Every word, image, and link on the public site is editable from the admin panel. No code required.',
    icon: LayoutDashboard,
  },
  {
    id: 'rich-editor',
    triggerTime: 113,
    position: { top: '45%', left: '50%' },
    title: 'Rich Text Editor',
    description: 'TipTap-powered editor with Figma prototype embedding, image upload, video embed, and code blocks.',
    icon: Type,
  },
];

const FEATURES = [
  {
    icon: Globe,
    title: '3D Interactive Globe',
    description: 'Three.js earth with texture mapping, atmosphere glow, drag-to-rotate, and touch support.',
    tag: 'Three.js r128',
  },
  {
    icon: LayoutDashboard,
    title: 'WordPress-Style CMS',
    description: 'Full admin panel at /console — edit projects, testimonials, GIS tools, site copy, and branding.',
    tag: 'Supabase',
  },
  {
    icon: Type,
    title: 'Rich Text Editor',
    description: 'TipTap-powered editor with Figma prototype embedding, image upload, code blocks, and video embed.',
    tag: 'TipTap',
  },
  {
    icon: Cpu,
    title: 'AI Spatial Audit',
    description: 'Powered by Anthropic Claude. Analyse any spatial challenge and receive a GIS methodology report.',
    tag: 'Claude API',
  },
  {
    icon: Moon,
    title: 'Dark / Light Mode',
    description: 'Full CSS variable system. Every element contrasts correctly in both modes. Persists via localStorage.',
    tag: 'CSS Variables',
  },
  {
    icon: Map,
    title: 'GIS Intelligence Lab',
    description: 'Interactive command center with spatial data nodes, system logs, and geospatial toolbox.',
    tag: 'GIS / Mapbox',
  },
];

// --- UTILS ---

const formatTime = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// --- SUB-COMPONENTS ---

function HotspotTooltip({ hotspot, onDismiss }: { hotspot: any; onDismiss: () => void }) {
  const Icon = hotspot.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      style={{
        position: 'absolute',
        top: hotspot.position.top,
        left: hotspot.position.left,
        zIndex: 50,
        maxWidth: '260px',
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(37,99,235,0.4)',
        borderRadius: '14px',
        padding: '16px 18px',
        boxShadow: '0 0 24px rgba(37,99,235,0.25)',
      }}
    >
      <div style={{
        position: 'absolute', top: '-6px', left: '20px',
        width: 12, height: 12, borderRadius: '50%', background: '#2563EB',
        boxShadow: '0 0 0 0 rgba(37,99,235,0.4)',
        animation: 'hotspotPulse 1.5s infinite',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Icon size={16} color="#2563EB" />
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#F1F5F9' }}>
          {hotspot.title}
        </span>
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 12px' }}>
        {hotspot.description}
      </p>
      <button
        onClick={onDismiss}
        style={{
          background: '#2563EB', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '12px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        <Play size={11} fill="white" /> Continue
      </button>
    </motion.div>
  );
}

function ScreenshotSequence({ settings }: { settings: any }) {
  const [index, setIndex] = useState(0);
  const screens = [
    { src: settings?.mockup_screen_1 || '/mockup/screen-public-home.png', label: 'Homepage Hero' },
    { src: settings?.mockup_screen_2 || '/mockup/screen-public-project.png', label: 'Projects Grid' },
    { src: settings?.mockup_screen_3 || '/mockup/screen-admin-dashboard.png', label: 'GIS Lab' },
    { src: settings?.mockup_screen_4 || '/mockup/screen-public-home.png', label: 'AI Audit' },
    { src: settings?.mockup_screen_5 || '/mockup/screen-admin-dashboard.png', label: 'Admin CMS' },
    { src: settings?.mockup_screen_6 || '/mockup/screen-admin-content.png', label: 'Rich Text Editor' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % screens.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={screens[index].src}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {screens.map((_, i) => (
          <div key={i} className={`h-1 transition-all duration-300 rounded-full ${i === index ? 'w-8 bg-accent-blue' : 'w-2 bg-white/20'}`} />
        ))}
      </div>
      <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <p className="text-[10px] font-mono text-accent-blue uppercase tracking-widest">{screens[index].label}</p>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function MockupShowcase() {
  const [settings, setSettings] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<any>(null);
  const [muted, setMuted] = useState(true);
  const [dismissedHotspots, setDismissedHotspots] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('key,value');
      if (data) {
        const s: any = {};
        data.forEach(item => s[item.key] = item.value);
        setSettings(s);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const current = VIDEO_CHAPTERS.findIndex((c, i) => {
      const next = VIDEO_CHAPTERS[i + 1];
      return currentTime >= c.startTime && (!next || currentTime < next.startTime);
    });
    if (current !== -1) setActiveChapter(current);
  }, [currentTime]);

  useEffect(() => {
    const hit = HOTSPOTS.find(h =>
      Math.abs(currentTime - h.triggerTime) < 0.3 && !dismissedHotspots.includes(h.id)
    );
    if (hit && playing) {
      videoRef.current?.pause();
      setPlaying(false);
      setActiveHotspot(hit);
    }
  }, [currentTime, playing, dismissedHotspots]);

  const togglePlay = () => {
    if (playing) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setPlaying(!playing);
  };

  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if (!playing) videoRef.current.play();
    }
  };

  const copyEmbedCode = () => {
    const code = `<iframe\n  src="${window.location.origin}/mockup"\n  width="100%"\n  height="600px"\n  style="border:none;border-radius:16px;"\n  allowfullscreen\n></iframe>`;
    navigator.clipboard.writeText(code);
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F1F5F9] selection:bg-accent-blue/30 overflow-x-hidden">
      <style>{`
        @keyframes hotspotPulse {
          0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.6); }
          70%  { box-shadow: 0 0 0 10px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #2563EB;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(37,99,235,0.5);
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="pt-20 pb-10 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/30 rounded-full px-4 py-1.5 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent-lime animate-pulse shadow-[0_0_8px_#84CC16]" />
          <span className="font-mono text-[10px] text-accent-lime uppercase tracking-widest font-bold">LIVE_PORTFOLIO_DEMO</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-6"
        >
          The Cartographer's Console
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A full-stack GIS & UX designer portfolio with WordPress-style Admin CMS, dark/light mode, AI-powered spatial audit, and 3D interactive globe.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {['React', 'Vite', 'Supabase', 'Three.js', 'Framer Motion', 'Claude API'].map(tech => (
            <span key={tech} className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] font-mono text-slate-500 uppercase tracking-wider">{tech}</span>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a href="/" target="_blank" className="flex items-center gap-2 bg-accent-blue hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 active:scale-95">
            <ExternalLink size={18} /> View Live Site
          </a>
          <a href="/console" target="_blank" className="flex items-center gap-2 bg-transparent border border-blue-600/50 text-accent-blue hover:bg-blue-600/5 px-8 py-3.5 rounded-2xl font-bold transition-all active:scale-95">
            <Lock size={18} /> Admin Demo
          </a>
        </motion.div>
      </section>

      {/* VIDEO PLAYER SECTION */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Browser Frame */}
          <div className="bg-[#1A1A1A] rounded-t-2xl border border-white/10 border-b-0 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 bg-[#2A2A2A] rounded-lg px-4 py-1.5 flex items-center gap-2 text-[10px] font-mono text-slate-500 overflow-hidden">
              <Lock size={10} className="shrink-0" />
              <span className="truncate">the-portfolio-jet.vercel.app</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-accent-lime/10 border border-accent-lime/20 px-2.5 py-1 rounded-full text-[9px] font-mono text-accent-lime font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-lime" />
              LIVE
            </div>
          </div>

          {/* Player Surface */}
          <div className="relative border border-white/10 rounded-b-2xl overflow-hidden shadow-2xl bg-black aspect-video group">
            {settings?.mockup_video_url ? (
              <video
                ref={videoRef}
                src={settings.mockup_video_url}
                className="w-full h-full object-cover"
                muted={muted}
                playsInline
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            ) : (
              <ScreenshotSequence settings={settings} />
            )}

            {/* Hotspot Layer */}
            <AnimatePresence>
              {activeHotspot && (
                <HotspotTooltip 
                  hotspot={activeHotspot} 
                  onDismiss={() => {
                    setDismissedHotspots([...dismissedHotspots, activeHotspot.id]);
                    setActiveHotspot(null);
                    videoRef.current?.play();
                  }} 
                />
              )}
            </AnimatePresence>

            {/* Click Overlay */}
            <div 
              className="absolute inset-0 z-10 cursor-pointer" 
              onClick={togglePlay}
            />

            {/* Play Overlay */}
            {!playing && !activeHotspot && (
              <div 
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
                onClick={togglePlay}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-full bg-accent-blue text-white flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                >
                  <Play size={32} fill="currentColor" className="ml-1" />
                </motion.div>
              </div>
            )}

            {/* Mute Toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
              className="absolute bottom-6 right-6 z-30 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          {/* Controls */}
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => jumpToTime(parseFloat(e.target.value))}
                className="flex-1 appearance-none bg-white/5 h-1 rounded-full cursor-pointer"
              />
              <div className="font-mono text-[10px] text-slate-500 w-24 text-right">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Chapter Pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {VIDEO_CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => jumpToTime(ch.startTime)}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold font-mono uppercase tracking-widest transition-all ${
                    activeChapter === idx 
                      ? 'bg-accent-blue text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/5 text-slate-500 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SPLIT VIEW SECTION */}
      <section className="py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Public View <span className="text-slate-700">↔</span> Admin Console</h2>
            <p className="text-slate-400 max-w-xl mx-auto">One codebase. Two completely different experiences. Everything the visitor sees is controlled by the admin in real-time.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Public Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-white/10 overflow-hidden bg-white/[0.02]"
            >
              <div className="bg-[#1A1A1A] px-5 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono text-accent-lime font-bold uppercase tracking-widest">
                  <Globe size={14} /> PUBLIC_INTERFACE
                </div>
                <div className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
              </div>
              <div className="aspect-[16/10] bg-black">
                <img src={settings?.mockup_screen_1 || '/mockup/screen-public-home.png'} alt="Public View" className="w-full h-full object-cover" />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold mb-3">Visitor Experience</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  A immersive, interactive frontend designed for high conversion. Features include the Three.js globe, dynamic bento grids, and an automated AI-driven spatial audit tool.
                </p>
              </div>
            </motion.div>

            {/* Admin Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-blue-600/30 overflow-hidden bg-blue-600/[0.02] shadow-[0_0_50px_rgba(37,99,235,0.05)]"
            >
              <div className="bg-[#1A1A1A] px-5 py-3 border-b border-blue-600/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono text-accent-blue font-bold uppercase tracking-widest">
                  <Lock size={14} /> ADMIN_CMS — SECURE
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <div className="w-2 h-2 rounded-full bg-blue-600/30" />
                </div>
              </div>
              <div className="aspect-[16/10] bg-black">
                <img src={settings?.mockup_screen_5 || '/mockup/screen-admin-dashboard.png'} alt="Admin View" className="w-full h-full object-cover" />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold mb-3">The Command Center</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  A custom WordPress-style CMS. The admin can manage projects, update metadata, process enquiries, and even adjust the 3D globe's operational parameters without writing a single line of code.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold mb-4">Core Architecture</h2>
          <p className="text-slate-400">High-performance features that define the next generation of portfolios.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-600/30 hover:bg-blue-600/[0.02] transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform duration-500">
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-mono text-accent-lime bg-accent-lime/10 px-3 py-1 rounded-full font-bold border border-accent-lime/20">{f.tag}</span>
                </div>
                <h3 className="text-lg font-bold mb-3 group-hover:text-white transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* THEME COMPARISON */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold mb-4">Universal Adaptation</h2>
          <p className="text-slate-400">Every component is engineered to perfectly transition between light and dark modes.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative rounded-3xl overflow-hidden border border-white/5 group">
            <img src={settings?.mockup_screen_dark || '/mockup/screen-public-home.png'} alt="Dark Mode" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
              <div className="flex items-center gap-3 font-mono text-xs text-white">
                <Moon size={16} className="text-accent-blue" /> DARK_MODE_V1.0 (DEFAULT)
              </div>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-black/5 group">
            <img src={settings?.mockup_screen_light || '/mockup/screen-public-home.png'} alt="Light Mode" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[0.5] hover:grayscale-0 transition-all" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent flex items-end p-8">
              <div className="flex items-center gap-3 font-mono text-xs text-slate-900 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl">
                <Sun size={16} className="text-amber-500" /> LIGHT_MODE_V1.0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EMBED CTA */}
      <section className="px-6 pb-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600/10 to-accent-lime/5 border border-blue-600/20 rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-lime/10 rounded-full blur-[100px]" />
          
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Embed the Future</h2>
          <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
            Showcase this interactive portfolio system within your own presentation or external platform.
          </p>

          <div className="relative max-w-2xl mx-auto group">
            <pre className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left font-mono text-[11px] text-accent-lime overflow-x-auto whitespace-pre leading-relaxed shadow-2xl">
{`<iframe
  src="${window.location.origin}/mockup"
  width="100%"
  height="600px"
  style="border:none;border-radius:16px;"
  allowfullscreen
></iframe>`}
            </pre>
            <button 
              onClick={copyEmbedCode}
              className="absolute top-4 right-4 bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Copy size={14} /> Copy Code
            </button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">
          ENGINEERED_BY_EBUBECHUKWU // SYSTEM_V4.0.1
        </p>
      </footer>
    </div>
  );
}
