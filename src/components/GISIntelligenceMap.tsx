import { motion } from 'framer-motion';

export default function GISIntelligenceMap({ title }: { title: string }) {
  return (
    <div className="relative w-full h-full bg-[#050b15] overflow-hidden rounded-xl border border-accent-blue/30 shadow-[0_0_40px_rgba(30,58,138,0.2)]">
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: `linear-gradient(var(--accent-blue) 1px, transparent 1px), linear-gradient(90deg, var(--accent-blue) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Scanning Line */}
      <motion.div 
        className="absolute inset-x-0 h-[2px] bg-accent-blue/50 shadow-[0_0_15px_var(--accent-blue)] z-10"
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Simulated Map Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full p-12">
            
            {/* Abstract Topographic Curves (SVG) */}
            <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
                <path d="M0,100 Q150,50 300,150 T600,100" stroke="var(--accent-blue)" fill="none" strokeWidth="1" />
                <path d="M0,200 Q200,150 400,250 T800,200" stroke="var(--accent-blue)" fill="none" strokeWidth="1" />
                <path d="M100,0 Q150,150 50,300 T100,600" stroke="var(--accent-blue)" fill="none" strokeWidth="1" />
            </svg>

            {/* Random Data nodes */}
            {[...Array(6)].map((_, i) => (
                <motion.div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-accent-blue/80 shadow-[0_0_10px_var(--accent-blue)]"
                    style={{ 
                        left: `${Math.random() * 80 + 10}%`, 
                        top: `${Math.random() * 80 + 10}%` 
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                />
            ))}

            {/* Central Target Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 border border-accent-blue/40 rounded-full animate-ping opacity-20" />
                <div className="w-64 h-64 border border-accent-blue/20 rounded-full animate-pulse opacity-10" />
            </div>

            {/* Diagnostics HUD Overlay */}
            <div className="absolute top-6 left-6 font-mono text-[10px] text-accent-blue space-y-1">
                <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" /> SATELLITE_LINK: ACTIVE</p>
                <p>SIGNAL_STRENGTH: 94.2%</p>
                <p>LAT_RES: 0.00041m</p>
            </div>

            <div className="absolute bottom-6 right-6 text-right font-mono text-[10px] text-accent-blue">
                <p className="uppercase tracking-widest">{title || 'SYSTEM_READY'}</p>
                <p className="opacity-40">AUTO_SCAN_V4.2</p>
            </div>
        </div>
      </div>

      {/* Title Overlay */}
      <div className="absolute top-0 right-0 bg-accent-blue/10 backdrop-blur-md px-4 py-2 border-b border-l border-accent-blue/30 rounded-bl-xl">
        <p className="text-[10px] font-mono text-accent-blue tracking-tighter">DATASET_RENDER: {title?.toUpperCase() || 'UNKNOWN'}</p>
      </div>
    </div>
  );
}
