import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <div
      className={`glass-card rounded-xl p-6 ${hover ? 'card-hover' : ''} ${className} transition-colors`}
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--bg-glass-border)',
      }}
    >
      {children}
    </div>
  );
}
