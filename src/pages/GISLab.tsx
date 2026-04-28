import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import GlassCard from '../components/GlassCard';
import SectionEntrance from '../components/SectionEntrance';
import GISIntelligenceMap from '../components/GISIntelligenceMap';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Globe, Loader2, Database, Shield, Zap } from 'lucide-react';
import ThreeGlobe from '../components/ThreeGlobe';

interface GISFolder {
  id: string;
  folder_name: string;
  display_order: number;
}

export default function GISLab() {
  const [folders, setFolders] = useState<GISFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<GISFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    async function loadFolders() {
      const { data } = await supabase.from('gis_folders').select('*').order('display_order');
      if (data && data.length > 0) {
        setFolders(data);
        setSelectedFolder(data[0]);
      }
      setLoading(false);
    }
    loadFolders();
  }, []);

  // Simulate logging activity when folder changes
  useEffect(() => {
    if (!selectedFolder) return;
    
    setLogs([
      `[INIT] ACCESSING_NODE: ${selectedFolder.folder_name.toUpperCase()}`,
      `[AUTH] PERMISSION_GRANTED_LEVEL_A`,
      `[DATA] STREAMING_PACKETS...`,
      `[SYNC] COORDINATE_FRAME: WGS_84_REV_2`,
    ]);

    const interval = setInterval(() => {
      const msg = [
        `[SCAN] NODE_IDENTIFIED: 0x${Math.floor(Math.random()*1000).toString(16)}`,
        `[CALC] PROCESSING_LAYER_${Math.floor(Math.random()*5)}`,
        `[WARN] CLOUD_COVER_THRESHOLD_MET`,
        `[INFO] SYNCING_METADATA_VAULT`,
        `[DATA] LAT: ${Math.random().toFixed(4)} LON: ${Math.random().toFixed(4)}`
      ];
      setLogs(prev => [...prev.slice(-8), msg[Math.floor(Math.random() * msg.length)]]);
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedFolder]);

  if (loading) return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-accent-blue" size={48} />
        <p className="font-mono text-xs text-muted animate-pulse uppercase tracking-widest">establishing_secure_geospatial_tunnel...</p>
    </div>
  );

  return (
    <div className="bg-primary transition-colors min-h-screen py-16 px-4 font-sans text-primary">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header HUD */}
        <SectionEntrance>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border-default pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-accent-blue text-xs font-mono mb-2 uppercase tracking-tighter">
                        <Shield size={14} />
                        SECURE_ACCESS_ESTABLISHED
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display uppercase tracking-tight break-words leading-[1.1]">
                        GIS Intelligence Lab
                    </h1>
                    <p className="text-secondary text-sm max-w-xl">
                        Interactive command bridge for multi-scalar spatial intelligence. Bridging the gap between raw geodata and operational insight.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-surface px-6 py-3 rounded-2xl border border-border-default shadow-sm font-mono text-[10px]">
                    <Activity size={16} className="text-accent-lime animate-pulse" />
                    <div>
                        <p className="text-muted uppercase">System Status</p>
                        <p className="text-accent-lime font-bold">NODE_STABLE_V12</p>
                    </div>
                </div>
            </div>
        </SectionEntrance>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Node Navigation (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-[10px] font-mono text-muted uppercase tracking-widest px-1 flex items-center gap-2">
                <Database size={12} />
                AVAILABLE_DATA_NODES
            </h3>
            <div className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full text-left px-4 py-4 rounded-xl text-sm transition-all flex items-center justify-between group border relative overflow-hidden ${
                    selectedFolder?.id === folder.id
                      ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/40 shadow-sm'
                      : 'text-secondary hover:bg-surface border-transparent hover:border-border-default'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <Globe size={18} className={selectedFolder?.id === folder.id ? 'animate-spin-slow' : 'opacity-40'} />
                    <span className="font-heading font-medium tracking-tight uppercase">{folder.folder_name}</span>
                  </div>
                  {selectedFolder?.id === folder.id && (
                      <motion.div 
                        layoutId="active-folder" 
                        className="absolute inset-y-0 left-0 w-1 bg-accent-blue" 
                        initial={false}
                      />
                  )}
                </button>
              ))}
            </div>

            <GlassCard className="p-4 border-accent-blue/10">
                <h4 className="text-[10px] font-mono text-muted uppercase mb-4 flex items-center gap-2">
                    <Terminal size={12} />
                    SYSTEM_LOGS
                </h4>
                <div className="space-y-1.5 min-h-[140px] font-mono text-[9px] text-accent-blue leading-tight opacity-80">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-2">
                            <span className="opacity-30">[{i}]</span>
                            <span className="break-all">{log}</span>
                        </div>
                    ))}
                    <span className="inline-block w-1 h-3 bg-accent-blue animate-pulse align-middle" />
                </div>
            </GlassCard>

            <div className="aspect-square w-full rounded-3xl border border-border-default overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none z-10" />
                <div className="absolute top-4 left-4 z-20">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-mono uppercase tracking-widest">
                        <Zap size={10} className="text-accent-blue animate-pulse" />
                        Live_Globe_View
                    </div>
                </div>
                <div className="w-full h-full bg-[#050505]">
                    <ThreeGlobe />
                </div>
            </div>
          </div>

          {/* Main Visual Node (9 Cols) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[16/7]">
                <GISIntelligenceMap title={selectedFolder?.folder_name || 'INITIALIZING'} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                    <p className="text-[10px] font-mono text-muted uppercase mb-2">Coordination_Frame</p>
                    <p className="text-xl font-display text-accent-blue">WGS 1984</p>
                    <p className="text-[10px] text-muted font-mono mt-1 italic">/ EPSG: 4326</p>
                </GlassCard>
                <GlassCard className="p-6">
                    <p className="text-[10px] font-mono text-muted uppercase mb-2">Active_Bounds</p>
                    <p className="text-xl font-display text-primary">Western Africa</p>
                    <p className="text-[10px] text-muted font-mono mt-1 italic">/ Sub-Sahara Node</p>
                </GlassCard>
                <GlassCard className="p-6">
                    <p className="text-[10px] font-mono text-muted uppercase mb-2">Data_Resolution</p>
                    <p className="text-xl font-display text-accent-lime">10M Sentinel</p>
                    <p className="text-[10px] text-muted font-mono mt-1 italic">/ Multispectral Feed</p>
                </GlassCard>
            </div>
          </div>
        </div>

        {/* Action Toolbox */}
        <SectionEntrance>
            <div className="pt-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-display uppercase tracking-tight">Geospatial_Toolbox</h2>
                    <div className="h-[1px] flex-1 bg-border-default mx-8 opacity-40" />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'Heat Island Detection', desc: 'Processing thermal bands to map urban temperature deltas and microclimate zones.', icon: Activity },
                        { title: 'NDVI Vegetation Index', desc: 'Analyzing multispectral reflectance to determine biomass health and agricultural output.', icon: Globe },
                        { title: 'Hydrographic Analysis', desc: 'Subsurface terrain modeling and drainage basin calculation via automated DEM processing.', icon: Database },
                    ].map((tool, i) => (
                    <GlassCard key={i} className="group hover:-translate-y-1 transition-all duration-300">
                        <div className="p-6 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-surface border border-border-default flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform">
                                <tool.icon size={20} />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-primary tracking-tight mb-2 uppercase text-sm">{tool.title}</h3>
                                <p className="text-xs text-secondary leading-relaxed mb-4">{tool.desc}</p>
                            </div>
                            <button className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-2 group-hover:gap-3 transition-all">
                                ACCESS_TOOL_LOGIC <span className="opacity-50">→</span>
                            </button>
                        </div>
                    </GlassCard>
                    ))}
                </div>
            </div>
        </SectionEntrance>
      </div>
    </div>
  );
}
