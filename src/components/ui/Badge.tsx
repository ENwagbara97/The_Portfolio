import { ReactNode } from 'react';

const typeColors: Record<string, string> = {
  GIS: 'bg-light-zone text-accent-blue border-border-active/50',
  UX: 'bg-light-zone text-accent-blue border-border-active/50',
  Hybrid: 'bg-light-zone text-accent-blue border-border-active/50',
  default: 'bg-light-zone text-accent-blue border-border-active/50',
};

interface BadgeProps {
  children: ReactNode;
  variant?: string;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const colorClass = typeColors[variant] ?? typeColors.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border ${colorClass} ${className}`}>
      {children}
    </span>
  );
}
