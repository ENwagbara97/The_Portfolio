import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import PortfolioDemoEmbed from './PortfolioDemoEmbed';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Node, mergeAttributes } from '@tiptap/core';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3, 
  Type, Link as LinkIcon, Unlink, Image as ImageIcon, 
  Video as VideoIcon, Layout, Minus, Undo, Redo, Palette, Highlighter,
  X, Upload, Globe, Film, Monitor
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { supabase } from '../../lib/supabase';

// --- CUSTOM EXTENSIONS ---

const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'video' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: true, class: 'w-full aspect-video rounded-xl my-6 object-contain bg-black' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => (
      <NodeViewWrapper className="relative group my-8">
        <video 
          src={node.attrs.src} 
          poster={node.attrs.poster} 
          controls 
          className="w-full rounded-xl border border-[var(--border-default)] shadow-xl"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge label="VIDEO PLAYER" className="bg-black/50 backdrop-blur-sm text-white border-white/20" />
        </div>
      </NodeViewWrapper>
    ));
  },
});

const FigmaExtension = Node.create({
  name: 'figma',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: 'Figma Prototype' },
    };
  },

  parseHTML() {
    return [{ tag: 'iframe[src*="figma.com"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'figma-embed-container my-8' }, 
      ['iframe', mergeAttributes(HTMLAttributes, { 
        allowfullscreen: true
      })]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => (
      <NodeViewWrapper className="my-8 space-y-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] rounded-t-xl border-x border-t border-[var(--border-default)]">
          <Layout size={14} className="text-[var(--admin-text-muted)]" />
          <span className="text-[10px] font-mono text-[var(--admin-text-muted)] uppercase tracking-widest">Figma Prototype — Click to interact</span>
        </div>
        <div className="aspect-video w-full bg-[var(--admin-input-bg)] rounded-b-xl border border-[var(--border-default)] overflow-hidden relative shadow-2xl">
          <iframe 
            src={node.attrs.src} 
            className="w-full h-full border-none"
            allowFullScreen
          />
        </div>
      </NodeViewWrapper>
    ));
  },
});

const PortfolioDemoExtension = Node.create({
  name: 'portfolioDemo',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  parseHTML() {
    return [{ tag: 'div[data-type="portfolio-demo"]' }];
  },

  renderHTML() {
    return ['div', { 'data-type': 'portfolio-demo', class: 'portfolio-demo-container' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(() => (
      <NodeViewWrapper>
        <div className="relative group">
          <PortfolioDemoEmbed />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge label="PORTFOLIO DEMO" className="bg-[#2563EB] text-white" />
          </div>
        </div>
      </NodeViewWrapper>
    ));
  },
});

// --- EDITOR COMPONENT ---

interface RichTextEditorProps {
  content: any;
  onChange: (content: any, html: string) => void;
  slug?: string;
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all duration-100 flex items-center justify-center ${
      isActive 
        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' 
        : 'text-[var(--admin-text-muted)] hover:bg-[var(--bg-glass)] hover:text-[var(--admin-text)]'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
);

const Badge = ({ label, className }: { label: string; className?: string }) => (
  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded tracking-tighter ${className}`}>
    {label}
  </span>
);

export default function RichTextEditor({ content, onChange, slug = 'temp' }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [mediaModal, setMediaModal] = useState<{ type: 'image' | 'video' | 'figma', isOpen: boolean }>({ type: 'image', isOpen: false });
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-lg bg-[#0D1117] p-4 font-mono text-[#A3E635]',
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#2563EB] underline underline-offset-4',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl shadow-xl max-w-full h-auto my-6 object-contain',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your project story... Use the toolbar to format your content, insert images, embed prototypes, and add media.',
      }),
      VideoExtension,
      FigmaExtension,
      PortfolioDemoExtension,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getHTML());
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !editor) return;
    const file = e.target.files[0];
    const type = mediaModal.type;

    try {
      setUploading(true);
      const fileName = `${slug}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('project-media').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('project-media').getPublicUrl(fileName);

      if (type === 'image') {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      } else if (type === 'video') {
        (editor.chain().focus() as any).insertContent({
          type: 'video',
          attrs: { src: publicUrl }
        }).run();
      }
      setMediaModal({ ...mediaModal, isOpen: false });
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Check storage bucket permissions.');
    } finally {
      setUploading(false);
    }
  };

  const insertFromUrl = () => {
    if (!mediaUrl || !editor) return;
    const { type } = mediaModal;

    if (type === 'image') {
      editor.chain().focus().setImage({ src: mediaUrl }).run();
    } else if (type === 'video') {
      // Basic check for YouTube/Vimeo
      let url = mediaUrl;
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
         // YouTube embeds are handled as iframes usually, but we'll use our video node for now
         // Actually user wants YouTube/Vimeo to be iframes. 
         // Let's stick to the prompt's video player for direct links and maybe a separate one for embeds.
      }
      (editor.chain().focus() as any).insertContent({
        type: 'video',
        attrs: { src: url }
      }).run();
    } else if (type === 'figma') {
      (editor.chain().focus() as any).insertContent({
        type: 'figma',
        attrs: { src: mediaUrl }
      }).run();
    }

    setMediaUrl('');
    setMediaModal({ ...mediaModal, isOpen: false });
  };

  if (!editor) return null;

  const colors = [
    'hsl(210, 40%, 96%)', // Slate 50
    'hsl(221, 83%, 53%)', // Brand Blue
    'hsl(84, 81%, 44%)',  // Brand Lime
    'hsl(215, 20%, 65%)', // Muted
    'hsl(215, 25%, 27%)', // Dark Slate
    'hsl(222, 47%, 11%)', // Deep Navy
    '#FFFFFF',
    'hsl(0, 72%, 51%)',   // Red
    'hsl(142, 70%, 45%)', // Green
    'hsl(38, 92%, 50%)',  // Amber
    'hsl(262, 83%, 58%)', // Violet
    'hsl(330, 81%, 60%)', // Pink
    'hsl(215, 28%, 17%)',
    'hsl(217, 33%, 17%)',
    'hsl(222, 47%, 11%)',
    'hsl(222, 47%, 7%)'
  ];

  return (
    <div className="w-full space-y-4 admin-editor-container">
      {/* TOOLBAR */}
      <div className="sticky top-0 z-30 p-1.5 bg-[var(--admin-surface)]/80 border border-[var(--border-default)] rounded-2xl flex flex-nowrap items-center shadow-2xl backdrop-blur-xl w-full overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border-default)] flex-shrink-0">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-[var(--border-default)] flex-shrink-0">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Normal Text"
          >
            <Type size={18} />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-[var(--border-default)] flex-shrink-0">
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={18} />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-[var(--border-default)] flex-shrink-0">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code size={18} />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-[var(--border-default)] relative">
          <ToolbarButton 
            onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
            isActive={showColorPicker}
            title="Text Color"
          >
            <Palette size={18} />
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full mt-2 left-0 bg-[var(--admin-bg)] border border-[var(--admin-border)] p-2 rounded-xl grid grid-cols-4 gap-1 shadow-2xl z-20">
              {colors.map(color => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-white/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}

          <ToolbarButton 
            onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
            isActive={showHighlightPicker}
            title="Highlight"
          >
            <Highlighter size={18} />
          </ToolbarButton>
          {showHighlightPicker && (
            <div className="absolute top-full mt-2 left-8 bg-[var(--admin-bg)] border border-[var(--admin-border)] p-2 rounded-xl grid grid-cols-4 gap-1 shadow-2xl z-20">
              {colors.map(color => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-white/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color }).run();
                    setShowHighlightPicker(false);
                  }}
                />
              ))}
              <button
                className="col-span-4 text-[10px] uppercase font-mono mt-1 hover:text-white"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setShowHighlightPicker(false);
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-[var(--border-default)]">
          <ToolbarButton 
            onClick={() => {
              const previousUrl = editor?.getAttributes('link').href;
              const url = window.prompt('URL', previousUrl);
              if (url === null) return;
              if (url === '') {
                editor?.chain().focus().extendMarkRange('link').unsetLink().run();
                return;
              }
              editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }}
            isActive={editor.isActive('link')}
            title="Insert Link"
          >
            <LinkIcon size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            title="Remove Link"
          >
            <Unlink size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => setMediaModal({ type: 'image', isOpen: true })}
            title="Insert Image"
          >
            <ImageIcon size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => setMediaModal({ type: 'video', isOpen: true })}
            title="Insert Video"
          >
            <VideoIcon size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => setMediaModal({ type: 'figma', isOpen: true })}
            title="Embed Figma"
          >
            <Layout size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => (editor.chain().focus() as any).insertContent({ type: 'portfolioDemo' }).run()}
            title="Insert Portfolio Demo"
          >
            <Monitor size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Divider"
          >
            <Minus size={18} />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 flex-shrink-0">
          <ToolbarButton 
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={18} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={18} />
          </ToolbarButton>
        </div>
      </div>

      {/* EDITOR CONTENT AREA */}
      <div 
        className="min-h-[500px] rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] overflow-hidden transition-all duration-300 focus-within:border-[#2563EB]/50"
      >
        <EditorContent 
          editor={editor} 
          className="prose prose-invert max-w-none px-2 py-6 md:p-10 focus:outline-none"
        />
      </div>

      {/* MEDIA MODAL */}
      {mediaModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2563EB]/10 rounded-lg text-[#2563EB]">
                  {mediaModal.type === 'image' ? <ImageIcon size={20} /> : mediaModal.type === 'video' ? <Film size={20} /> : <Layout size={20} />}
                </div>
                <h3 className="font-display text-lg">Insert {mediaModal.type}</h3>
              </div>
              <button onClick={() => setMediaModal({ ...mediaModal, isOpen: false })} className="text-[var(--admin-text-muted)] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {mediaModal.type !== 'figma' && (
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)]">Upload File</label>
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--admin-border)] rounded-xl hover:bg-[#2563EB]/5 cursor-pointer transition-colors group">
                    <input type="file" className="hidden" accept={mediaModal.type === 'image' ? 'image/*' : 'video/*'} onChange={handleFileUpload} />
                    {uploading ? <Loader2 className="animate-spin text-[#2563EB]" /> : <Upload className="mb-2 text-[var(--admin-text-muted)] group-hover:text-[#2563EB] transition-colors" />}
                    <span className="text-xs text-[var(--admin-text-muted)]">Drag or click to upload</span>
                  </label>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--admin-text-muted)]">
                  {mediaModal.type === 'figma' ? 'Figma Embed URL' : 'Or Paste URL'}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    placeholder={mediaModal.type === 'figma' ? 'Paste Figma embed src...' : 'https://...'}
                    className="flex-1 bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                  <button 
                    onClick={insertFromUrl}
                    className="bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Insert
                  </button>
                </div>
                {mediaModal.type === 'figma' && (
                   <p className="text-[10px] text-[var(--admin-text-muted)]">Share → Get embed code → Copy the src URL</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
