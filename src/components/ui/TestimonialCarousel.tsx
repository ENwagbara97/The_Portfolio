import { useRef, useState } from 'react';
import { Testimonial } from '../../lib/supabase';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Filter published testimonials and duplicate the array so the loop is seamless
  const validTestimonials = (testimonials ?? []).filter(t => t.is_published !== false);
  
  if (validTestimonials.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-muted font-mono text-xs italic border border-dashed border-border-default rounded-xl">
        [ No testimonials found. ]
      </div>
    );
  }

  const items = [...validTestimonials, ...validTestimonials];

  return (
    <div
      style={{ overflow: 'hidden', width: '100%', position: 'relative' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      className="py-4"
    >
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: '24px',
          width: 'max-content',
          animation: `carouselScroll 40s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {items.map((t, i) => (
          <div
            key={i}
            style={{
              width: '340px',
              flexShrink: 0,
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '16px',
              padding: '24px',
            }}
            className="shadow-card"
          >
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
              {[...Array(t.star_rating || 5)].map((_, starIdx) => (
                <span key={starIdx} className="text-amber-500 text-xs">★</span>
              ))}
            </div>
            <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '16px' }} className="text-sm italic leading-relaxed">
              "{t.quote_text}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {t.avatar_url ? (
                <img 
                  src={t.avatar_url} 
                  alt={t.person_name}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} 
                  className="border border-border-default"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-mono text-lg font-bold ${t.avatar_url ? 'hidden' : ''}`}
                style={{ background: 'var(--accent-blue, #2563EB)' }}
              >
                {t.person_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{t.person_name}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{t.person_role}, {t.person_company}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
