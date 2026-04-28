import { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Search, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  MessageSquare,
  ArrowRight,
  Plus,
  Settings
} from 'lucide-react';

export default function PortfolioDemoEmbed() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [screen, setScreen] = useState<'home' | 'projects' | 'detail' | 'admin'>('home');
  
  const colors = {
    dark: {
      bg: '#050505',
      card: '#111111',
      text: '#FFFFFF',
      muted: '#888888',
      accent: '#2563EB',
      border: '#222222'
    },
    light: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      text: '#0F172A',
      muted: '#64748B',
      accent: '#2563EB',
      border: '#E2E8F0'
    }
  };

  const c = colors[theme];

  const renderScreen = () => {
    switch(screen) {
      case 'home':
        return (
          <div className="h-full flex flex-col p-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
               <div className="w-20 h-3 rounded bg-[#2563EB]/20" />
               <div className="flex gap-2">
                 {[1,2,3].map(i => <div key={i} className="w-8 h-2 rounded bg-gray-500/20" />)}
               </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
               <div className="w-32 h-2 bg-[#2563EB] rounded-full mx-auto" />
               <h1 className="text-xl font-bold leading-tight">Cartographer of<br/>Systems.</h1>
               <p className="text-[10px] opacity-60 max-w-[180px]">Building spatial intelligence tools and human-centered digital products.</p>
               <div className="flex gap-2 mt-2">
                 <div className="px-3 py-1.5 bg-[#2563EB] rounded-lg text-[8px] font-bold">HIRE_ME</div>
                 <div className="px-3 py-1.5 border rounded-lg text-[8px] font-bold" style={{ borderColor: c.border }}>VIEW_WORK</div>
               </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="h-full p-4 animate-in slide-in-from-right-4 duration-300 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xs font-bold uppercase tracking-widest">02_PROJECTS</h2>
               <div className="flex gap-1">
                 <div className="w-4 h-4 rounded bg-[#2563EB] flex items-center justify-center text-[8px]">UX</div>
                 <div className="w-4 h-4 rounded bg-gray-500/20 flex items-center justify-center text-[8px]">GIS</div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="rounded-xl border p-2 space-y-2" style={{ backgroundColor: c.card, borderColor: c.border }} onClick={() => setScreen('detail')}>
                   <div className="aspect-video bg-gray-500/10 rounded-lg overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/20 to-transparent" />
                   </div>
                   <div className="h-2 w-12 bg-gray-500/20 rounded" />
                   <div className="h-3 w-20 bg-gray-500/40 rounded" />
                 </div>
               ))}
            </div>
          </div>
        );
      case 'detail':
        return (
          <div className="h-full animate-in zoom-in-95 duration-300 overflow-y-auto custom-scrollbar">
            <div className="h-32 bg-gray-500/10 relative">
               <button className="absolute top-2 left-2 p-1 bg-black/20 rounded-full" onClick={() => setScreen('projects')}>
                 <X size={10} />
               </button>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 rounded-full border-2 border-[#2563EB] border-dashed animate-spin-slow" />
               </div>
            </div>
            <div className="p-4 space-y-4">
               <div className="flex justify-between items-end">
                 <div className="space-y-1">
                   <div className="h-2 w-16 bg-[#2563EB]/40 rounded" />
                   <h2 className="text-sm font-bold">Spatial Health Monitor</h2>
                 </div>
                 <div className="px-2 py-1 bg-[#2563EB]/10 text-[#2563EB] text-[7px] rounded">2024_RELEASE</div>
               </div>
               <div className="space-y-2">
                 {[1,2,3].map(i => <div key={i} className="h-1.5 w-full bg-gray-500/10 rounded" />)}
                 <div className="h-1.5 w-2/3 bg-gray-500/10 rounded" />
               </div>
               <div className="h-24 bg-[#111] rounded-xl border border-white/5 flex items-center justify-center">
                 <Globe size={24} className="text-[#2563EB] opacity-40 animate-pulse" />
               </div>
            </div>
          </div>
        );
      case 'admin':
        return (
          <div className="h-full flex animate-in fade-in duration-300">
            <div className="w-12 border-r flex flex-col items-center py-4 gap-4" style={{ backgroundColor: '#111', borderColor: '#222' }}>
               <div className="w-6 h-6 bg-[#2563EB] rounded-lg" />
               {[LayoutDashboard, FileText, Briefcase, MessageSquare, Settings].map((Icon, i) => (
                 <Icon key={i} size={12} className={i === 0 ? 'text-[#2563EB]' : 'text-gray-500'} />
               ))}
            </div>
            <div className="flex-1 p-4 bg-[#050505] space-y-4">
               <div className="flex justify-between items-center">
                 <div className="h-3 w-24 bg-gray-800 rounded" />
                 <div className="w-16 h-6 bg-[#2563EB] rounded text-[8px] flex items-center justify-center font-bold">ADD_NEW</div>
               </div>
               <div className="space-y-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-10 bg-[#111] border border-white/5 rounded-lg flex items-center px-3 gap-3">
                     <div className="w-6 h-6 bg-gray-800 rounded" />
                     <div className="flex-1 space-y-1">
                       <div className="h-2 w-20 bg-gray-700 rounded" />
                       <div className="h-1.5 w-12 bg-gray-800 rounded" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-12 group/demo relative">
      <div className="absolute -top-6 right-0 flex items-center gap-2 text-[10px] font-mono text-gray-500 opacity-0 group-hover/demo:opacity-100 transition-opacity">
        <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-green-500" />
        INTERACTIVE_SIMULATION_ACTIVE
      </div>
      
      {/* Browser Chrome */}
      <div className="rounded-2xl border-4 overflow-hidden shadow-2xl transition-all duration-500" 
           style={{ 
             backgroundColor: c.bg, 
             borderColor: c.border,
             color: c.text
           }}>
        
        {/* Address Bar */}
        <div className="flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: c.border }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-gray-500/10 rounded-lg px-3 py-1.5 text-[9px] font-mono opacity-60">
            <Search size={10} />
            <span>ebube.sh/{screen === 'home' ? '' : screen}</span>
          </div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg hover:bg-gray-500/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          </button>
        </div>

        {/* Content Viewport */}
        <div className="h-[400px] relative overflow-hidden">
          {renderScreen()}
          
          {/* Mock Navigation Hover Overlay (for the demo experience) */}
          {screen !== 'admin' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 rounded-2xl border backdrop-blur-md transition-all shadow-xl"
                 style={{ backgroundColor: c.bg + '80', borderColor: c.border }}>
               {[
                 { id: 'home', label: '01', icon: Monitor },
                 { id: 'projects', label: '02', icon: Briefcase },
                 { id: 'admin', label: 'CMS', icon: LayoutDashboard }
               ].map(item => (
                 <button
                   key={item.id}
                   onClick={() => setScreen(item.id as any)}
                   className={`p-2 rounded-xl flex items-center gap-2 transition-all ${screen === item.id ? 'bg-[#2563EB] text-white' : 'hover:bg-gray-500/10'}`}
                 >
                   <item.icon size={12} />
                   <span className="text-[10px] font-bold">{item.label}</span>
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center px-2">
         <div className="flex gap-4">
           <div className="flex flex-col">
             <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">System</span>
             <span className="text-xs font-bold text-[#2563EB]">PORTFOLIO_OS_V1.0</span>
           </div>
           <div className="flex flex-col border-l pl-4 border-gray-800">
             <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">Status</span>
             <span className="text-xs font-bold text-green-500 flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
               OPERATIONAL
             </span>
           </div>
         </div>
         <p className="text-[10px] font-mono text-gray-500 max-w-[200px] text-right italic leading-tight">
           Mockup illustrates dynamic state-switching without full page reloads.
         </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2563EB40;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
