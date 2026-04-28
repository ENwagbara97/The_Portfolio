import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/GlassCard';
import { 
  Image as ImageIcon, 
  FileText, 
  Copy, 
  ExternalLink, 
  Search, 
  Filter,
  CheckCircle2,
  Loader2,
  Trash2,
  HardDrive,
  Activity
} from 'lucide-react';

const BUCKETS = ['cv-uploads', 'project-covers', 'project-pdfs', 'project-media'];

interface MediaFile {
  name: string;
  url: string;
  bucket: string;
  created_at: string;
  metadata?: any;
}

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    setLoading(true);
    setFetchError(null);
    let allFiles: MediaFile[] = [];

    try {
      const bucketsToFetch = selectedBucket === 'all' ? BUCKETS : [selectedBucket];
      
      for (const bucket of bucketsToFetch) {
        const { data, error } = await supabase.storage.from(bucket).list('', {
          limit: 100,
          offset: 0
        });

        if (error) {
          console.warn(`[Storage] Failed to list bucket: ${bucket}`, error.message);
          continue;
        }

        if (data) {
          const bucketFiles = data
            .filter(f => f.name !== '.emptyFolderPlaceholder')
            .map((f) => {
              const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(f.name);
              return {
                name: f.name,
                url: publicUrl,
                bucket: bucket,
                created_at: f.created_at,
                metadata: f.metadata
              };
            });
          allFiles = [...allFiles, ...bucketFiles];
        }
      }
      
      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setFiles(allFiles);
    } catch (err: any) {
      console.error('Error loading media:', err);
      setFetchError(err.message || 'Failed to connect to storage systems.');
    } finally {
      setLoading(false);
    }
  }

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) && 
    (selectedBucket === 'all' || f.bucket === selectedBucket)
  );

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  async function deleteFile(bucket: string, name: string) {
    if (confirm('Delete this file permanently?')) {
      const { error } = await supabase.storage.from(bucket).remove([name]);
      if (error) alert('Error: ' + error.message);
      else loadFiles();
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-[var(--admin-text)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-display text-[var(--admin-text)]">Media Library</h1>
          <p className="text-[var(--admin-text-muted)] text-sm">Centralized view of all geospatial assets and visual content.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={16} />
                <input 
                    type="text" 
                    placeholder="Search files..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all w-full md:w-64"
                    style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <select 
                  value={selectedBucket} 
                  onChange={e => setSelectedBucket(e.target.value)}
                  className="rounded-xl px-4 py-2.5 text-sm text-[var(--admin-text)] focus:outline-none min-w-[140px]"
                  style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)' }}
              >
                  <option value="all">All Buckets</option>
                  {BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <button 
                onClick={loadFiles} 
                className="p-2.5 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface)] rounded-xl text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-all flex items-center gap-2"
              >
                  <Filter size={18} />
                  <span className="text-xs font-mono">RELOAD</span>
              </button>
            </div>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
            <Activity size={14} />
            WARNING: {fetchError}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 size={48} className="animate-spin opacity-50" style={{ color: 'var(--admin-accent)' }} />
            <p className="text-sm font-mono tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>CONNECTING_TO_STORAGE_NODES...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-32 border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--admin-border)' }}>
            <HardDrive size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--admin-text-muted)' }} />
            <p style={{ color: 'var(--admin-text-muted)' }}>{search ? 'No matches found for your search.' : 'No media found in the selected nodes.'}</p>
            {!search && (
              <button onClick={loadFiles} className="mt-4 text-xs font-mono text-accent-blue hover:underline uppercase tracking-widest">
                Force_Rescan
              </button>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredFiles.map((file) => (
            <GlassCard key={file.url} className="group !p-0 overflow-hidden !bg-[var(--admin-card)] !border-[var(--admin-border)] hover:!border-[var(--admin-accent)] transition-all relative">
              <div className={`aspect-square relative overflow-hidden flex items-center justify-center ${file.name.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i) ? 'bg-white' : 'bg-[var(--admin-input-bg)]'}`}>
                {file.name.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i) ? (
                  <img src={file.url} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <FileText size={48} className="opacity-40" style={{ color: 'var(--admin-text-muted)' }} />
                )}
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                        onClick={() => copyToClipboard(file.url)}
                        className="p-2 rounded-lg transition-all shadow-xl"
                        style={{ backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                        title="Copy Public URL"
                    >
                        {copied === file.url ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    </button>
                    <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg transition-all"
                        style={{ backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                    >
                        <ExternalLink size={18} />
                    </a>
                    <button 
                        onClick={() => deleteFile(file.bucket, file.name)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        style={{ backgroundColor: 'var(--admin-surface)' }}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                    <span className="text-[10px] font-mono bg-black/50 text-white/70 px-1.5 py-0.5 rounded backdrop-blur-md">
                        {file.bucket}
                    </span>
                </div>
              </div>
              <div className="p-3 backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--admin-surface), transparent 20%)' }}>
                <p className="text-[10px] font-mono text-[var(--admin-text)] truncate" title={file.name}>{file.name}</p>
                <p className="text-[8px] text-[var(--admin-text-muted)] mt-1 uppercase font-bold tracking-tighter">Uploaded {new Date(file.created_at).toLocaleDateString()}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
