import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation libraries
          'vendor-motion': ['framer-motion', 'gsap'],
          // 3D / mapping (heaviest deps)
          'vendor-three': ['three'],
          'vendor-mapbox': ['mapbox-gl'],
          // Backend / forms
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-forms': ['react-hook-form', 'zod'],
          // Rich text editor (@tiptap/pm excluded — sub-path exports only, no root entry)
          'vendor-tiptap': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-color',
            '@tiptap/extension-highlight',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-text-align',
            '@tiptap/extension-text-style',
            '@tiptap/extension-underline',
          ],
        },
      },
    },
    // Suppress the 500kB warning now that chunks are split
    chunkSizeWarningLimit: 600,
  },
});
