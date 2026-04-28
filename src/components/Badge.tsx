interface BadgeProps {
  label: string;
  className?: string;
}

export default function Badge({ label, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-heading text-xs font-medium transition-colors ${className}`}
      style={{
        background: 'var(--accent-blue-glow)',
        border: '1px solid var(--border-active)',
        color: 'var(--accent-blue)',
      }}
    >
      {label}
    </span>
  );
}
