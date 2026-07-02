import { plainThreatLabel, toPlainThreat } from '@/lib/threat';

type Props = {
  level: string;
  compact?: boolean;
  showPlain?: boolean;
};

export function RiskBadge({ level, compact, showPlain = true }: Props) {
  const plain = toPlainThreat(level);
  const base = compact
    ? 'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border'
    : 'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border';

  const styles: Record<string, string> = {
    HIGH: 'border-rose-500/40 bg-rose-500/10 text-rose-400 pulse-critical',
    MEDIUM: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    LOW: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  };

  const technicalStyles: Record<string, string> = {
    CRITICAL: 'border-rose-500/40 bg-rose-500/10 text-rose-400 pulse-critical',
    EXTREME: 'border-rose-500/40 bg-rose-500/10 text-rose-400 pulse-critical',
    SEVERE: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
    WATCH: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    MODERATE: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    SAFE: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    MINOR: 'border-slate-500/40 bg-slate-500/10 text-slate-400',
  };

  if (showPlain) {
    return (
      <span className={`${base} ${styles[plain]}`} title={level}>
        {plainThreatLabel(level)}
      </span>
    );
  }

  return (
    <span className={`${base} ${technicalStyles[level.toUpperCase()] ?? technicalStyles.MINOR}`}>
      {level}
    </span>
  );
}

export function RiskMeter({ score }: { score: number }) {
  const normalized = Math.min(Math.max(score, 0), 100);
  const color =
    normalized >= 70 ? 'bg-gradient-to-r from-rose-600 to-rose-400' :
    normalized >= 40 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
    'bg-gradient-to-r from-emerald-600 to-emerald-400';

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
