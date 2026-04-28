import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { supabase } from '../lib/supabase';

export default function MainLayout() {
  useEffect(() => {
    async function syncMeta() {
      const { data } = await supabase.from('site_settings').select('key, value');
      if (data) {
        const smap: Record<string, string> = {};
        data.forEach(r => smap[r.key] = r.value);
        
        const title = smap.meta_title_home || `${smap.brand_name || 'Ebubechukwu Nwagbara'} — GIS & UX Designer | Port Harcourt`;
        const description = smap.meta_description_home || 'Cartographer of Systems. Architect of Experiences. GIS professional and UX designer building spatial intelligence tools and human-centered digital products.';
        const logoUrl = smap.brand_logo_url;
        const ogImage = smap.og_image_url || logoUrl;

        document.title = title;

        const updateMeta = (name: string, content: string, property?: boolean) => {
          let el = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`);
          if (!el) {
            el = document.createElement('meta');
            if (property) el.setAttribute('property', name);
            else el.setAttribute('name', name);
            document.head.appendChild(el);
          }
          el.setAttribute('content', content);
        };

        updateMeta('description', description);
        updateMeta('og:title', title, true);
        updateMeta('og:description', description, true);
        updateMeta('og:type', 'website', true);
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', title);
        
        if (ogImage) {
          updateMeta('og:image', ogImage, true);
          updateMeta('twitter:image', ogImage);
        }

        if (logoUrl) {
          document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/png';
          link.href = logoUrl;
          document.head.appendChild(link);
        }
      }
    }
    syncMeta();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 transition-all duration-300">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
