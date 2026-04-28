import { useEffect, useState } from 'react';

export function TerminalWindow({ lines, prompt }: { lines: string[], prompt?: string }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= lines.length) return;
    const line = lines[currentLine];
    if (currentChar < line.length) {
      const t = setTimeout(() => setCurrentChar((c) => c + 1), 30);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar]);

  const typingLine = currentLine < lines.length ? lines[currentLine].slice(0, currentChar) : null;

  return (
    <div
      className="rounded-lg p-4 font-mono text-sm border transition-colors"
      style={{
        background: 'var(--terminal-bg)',
        borderColor: 'var(--terminal-border)',
        boxShadow: `0 0 20px var(--accent-blue-glow)`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{prompt || 'ebube@cartographer ~ $'}</span>
      </div>
      <div className="space-y-1">
        {(visibleLines ?? []).map((line, i) => (
          <div key={i} className="terminal-line">{line ?? ''}</div>
        ))}
        {typingLine !== null && (
          <div className="terminal-line">
            {typingLine}
            <span className="animate-pulse">|</span>
          </div>
        )}
      </div>
    </div>
  );
}
