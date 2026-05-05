import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../lib/supabase';
import GlassCard from '../components/GlassCard';
import SectionEntrance from '../components/SectionEntrance';
import { motion } from 'framer-motion';
import { Terminal, Activity, Globe, Loader2, Database, Shield } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const ThreeGlobe = lazy(() => import('../components/ThreeGlobe'));

interface GISFolder {
  id: string;
  folder_name: string;
  display_order: number;
}

interface GISTool {
  id: string;
  title: string;
  description: string;
  tool_logic_url: string;
  icon_name: string;
  category: string;
  is_active: boolean;
  display_order: number;
}

// Fallback in case DB is not seeded or fails
const HARDCODED_FALLBACK_TOOLS = [
  { id: '1', title: 'HEAT ISLAND DETECTION', description: 'Processing thermal bands to map urban temperature deltas and microclimate zones.', tool_logic_url: '#', icon_name: 'Thermometer', category: 'Urban Planning', is_active: true, display_order: 1 },
  { id: '2', title: 'NDVI VEGETATION INDEX', description: 'Analyzing multispectral reflectance to determine biomass health and agricultural output.', tool_logic_url: '#', icon_name: 'Leaf', category: 'Environmental', is_active: true, display_order: 2 },
  { id: '3', title: 'HYDROGRAPHIC ANALYSIS', description: 'Subsurface terrain modeling and drainage basin calculation via automated DEM processing.', tool_logic_url: '#', icon_name: 'Droplets', category: 'Hydrography', is_active: true, display_order: 3 },
];

const DynamicIcon = ({ name, size, className }: { name: string, size: number, className?: string }) => {
  const Icon = (LucideIcons as any)[name] || Database;
  return <Icon size={size} className={className} />;
};

export default function GISLab() {
  const [folders, setFolders] = useState<GISFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<GISFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [gisTools, setGisTools] = useState<GISTool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: foldersData } = await supabase.from('gis_folders').select('*').order('display_order');
      if (foldersData && foldersData.length > 0) {
        setFolders(foldersData);
        setSelectedFolder(foldersData[0]);
      }
      
      const { data: toolsData, error } = await supabase
        .from('gis_tools')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
        
      if (!error && toolsData) {
        setGisTools(toolsData);
      }
      
      setToolsLoading(false);
      setLoading(false);
    }
    loadData();
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

  const displayedTools = gisTools.length > 0 ? gisTools : HARDCODED_FALLBACK_TOOLS;

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

        <div className="gis-lab-layout grid lg:grid-cols-12 gap-8">
          
          {/* Node Navigation (3 Cols) */}
          <div className="gis-lab-sidebar lg:col-span-3 space-y-6">
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

          </div>

          {/* Main Visual Node (9 Cols) */}
          <div className="lg:col-span-9 space-y-6">

            {/* Status badge */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-accent-lime/30 bg-accent-lime/5 w-fit">
                <span className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
                <span className="text-[11px] font-mono text-accent-lime uppercase tracking-widest">Interactive_GIS_Module_Active</span>
              </div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest">
                Node: {selectedFolder?.folder_name || 'INITIALIZING'}
              </p>
            </div>

            {/* ThreeGlobe */}
            <div className="gis-lab-map-panel w-full rounded-2xl overflow-hidden border border-accent-blue/30 bg-[#050b15]">
              <Suspense fallback={
                <div className="w-full h-[320px] md:h-[420px] flex items-center justify-center bg-[#050b15]">
                  <Loader2 className="animate-spin text-accent-blue" size={32} />
                </div>
              }>
                <ThreeGlobe />
              </Suspense>
              <div className="absolute top-4 left-4 font-mono text-[10px] text-accent-blue space-y-1 pointer-events-none z-10">
                <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" /> SATELLITE_LINK: ACTIVE</p>
                <p>SIGNAL_STRENGTH: 94.2%</p>
                <p>LAT_RES: 0.00041m</p>
              </div>
              <div className="absolute bottom-4 right-4 text-right font-mono text-[10px] text-accent-blue pointer-events-none z-10">
                <p className="uppercase tracking-widest">{selectedFolder?.folder_name || 'SYSTEM_READY'}</p>
                <p className="opacity-40">AUTO_SCAN_V4.2</p>
              </div>
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
                {toolsLoading ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                      <div key={i} style={{
                        height: '200px',
                        borderRadius: '16px',
                        background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-glass) 50%, var(--bg-surface) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }} />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                      {displayedTools.filter(t => !selectedFolder || t.category.toUpperCase() === selectedFolder.folder_name.toUpperCase()).length > 0 
                       ? displayedTools.filter(t => !selectedFolder || t.category.toUpperCase() === selectedFolder.folder_name.toUpperCase()).map((tool, i) => (
                      <GlassCard key={i} className="group hover:-translate-y-1 transition-all duration-300">
                          <div className="p-6 space-y-4">
                              <div className="w-10 h-10 rounded-xl bg-surface border border-border-default flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform">
                                  <DynamicIcon name={tool.icon_name} size={20} />
                              </div>
                              <div>
                                  <h3 className="font-heading font-bold text-primary tracking-tight mb-2 uppercase text-sm">{tool.title}</h3>
                                  <p className="text-xs text-secondary leading-relaxed mb-4">{tool.description}</p>
                              </div>
                              <a href={tool.tool_logic_url || '#'} className="text-[10px] font-mono uppercase tracking-widest text-accent-blue flex items-center gap-2 group-hover:gap-3 transition-all inline-block">
                                  ACCESS_TOOL_LOGIC <span className="opacity-50">→</span>
                              </a>
                          </div>
                      </GlassCard>
                      )) 
                      : (
                         <div className="col-span-3 text-center py-8 text-muted font-mono text-sm">
                           NO TOOLS FOUND FOR NODE: {selectedFolder?.folder_name.toUpperCase()}
                         </div>
                      )}
                  </div>
                )}
            </div>
        </SectionEntrance>
      </div>
    </div>
  );
}
