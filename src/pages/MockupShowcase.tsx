import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Screens — these are high-quality static screenshots saved in /public/mockup/
const SCREENS = {
  publicHome:   '/mockup/screen-public-home.png',
  publicProject:'/mockup/screen-public-project.png',
  adminDash:    '/mockup/screen-admin-dashboard.png',
  adminContent: '/mockup/screen-admin-content.png',
  lightMode:    '/mockup/screen-light-mode.png',
  darkMode:     '/mockup/screen-dark-mode.png',
};

export default function MockupShowcase() {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const screenRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Basic setup for GSAP ScrollTrigger
    const ctx = gsap.context(() => {
      if (!containerRef.current || !frameRef.current || !screenRef.current) return;

      // Pin the browser frame while content scrolls
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: frameRef.current,
      });

      // Screen transitions at scroll milestones
      gsap.to(screenRef.current, {
        opacity: 0, 
        duration: 0.4,
        scrollTrigger: { 
          trigger: containerRef.current, 
          start: '30% center', 
          toggleActions: 'play none none reverse' 
        },
        onComplete: () => { if(screenRef.current) screenRef.current.src = SCREENS.adminDash; },
        onReverseComplete: () => { if(screenRef.current) screenRef.current.src = SCREENS.publicHome; },
      });
      
      gsap.to(screenRef.current, {
        opacity: 1, 
        duration: 0.4,
        scrollTrigger: { 
          trigger: containerRef.current, 
          start: '35% center', 
          toggleActions: 'play none none reverse' 
        }
      });

      // Split view transition
      gsap.to(screenRef.current, {
        opacity: 0, 
        duration: 0.4,
        scrollTrigger: { 
          trigger: containerRef.current, 
          start: '60% center', 
          toggleActions: 'play none none reverse' 
        },
        onComplete: () => { if(screenRef.current) screenRef.current.src = SCREENS.adminContent; },
        onReverseComplete: () => { if(screenRef.current) screenRef.current.src = SCREENS.adminDash; },
      });
      
      gsap.to(screenRef.current, {
        opacity: 1, 
        duration: 0.4,
        scrollTrigger: { 
          trigger: containerRef.current, 
          start: '65% center', 
          toggleActions: 'play none none reverse' 
        }
      });

      // Theme comparison transition
      gsap.to(screenRef.current, {
        opacity: 0, 
        duration: 0.4,
        scrollTrigger: { 
          trigger: containerRef.current, 
          start: '80% center', 
          toggleActions: 'play none none reverse' 
        },
        onComplete: () => { if(screenRef.current) screenRef.current.src = SCREENS.lightMode; },
        onReverseComplete: () => { if(screenRef.current) screenRef.current.src = SCREENS.adminContent; },
      });
      
      gsap.to(screenRef.current, {
        opacity: 1, 
        duration: 0.4,
        scrollTrigger: { 
          trigger: containerRef.current, 
          start: '85% center', 
          toggleActions: 'play none none reverse' 
        }
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{ height: '400vh', background: '#0A0A0A', padding: '40px 20px', margin: 0, fontFamily: 'sans-serif' }}>
      {/* Sticky browser frame */}
      <div ref={frameRef} style={{
        position: 'sticky', top: '10vh',
        width: 'min(900px, 90vw)', margin: '0 auto',
        borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Browser chrome */}
        <div style={{
          background: '#1A1A1A', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
          <div style={{
            flex: 1, background: '#2A2A2A', borderRadius: '6px',
            padding: '4px 12px', marginLeft: '8px',
            fontFamily: 'monospace', fontSize: '12px', color: '#94A3B8'
          }}>
            ebubechukwu.com
          </div>
        </div>
        {/* Screen content */}
        <div style={{ background: '#000', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            ref={screenRef}
            src={SCREENS.publicHome}
            alt="Portfolio showcase"
            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            onError={(e) => {
              // Fallback placeholder if image not found
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div style="color: white; padding: 40px; font-family: monospace; text-align: center;">[MOCKUP_IMAGE_PLACEHOLDER]</div>';
            }}
          />
        </div>
      </div>

      {/* Scroll labels — appear at their respective scroll positions */}
      <div style={{ paddingTop: '80vh', textAlign: 'center', color: '#94A3B8' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {'>'} Switching to ADMIN_VIEW...
        </p>
      </div>
      <div style={{ paddingTop: '80vh', textAlign: 'center', color: '#94A3B8' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {'>'} SPLIT_VIEW: Public ↔ Admin
        </p>
      </div>
      <div style={{ paddingTop: '80vh', textAlign: 'center', color: '#94A3B8' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {'>'} THEME_COMPARISON: Dark / Light
        </p>
      </div>
    </div>
  );
}
