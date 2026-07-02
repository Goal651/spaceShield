'use client';

import { AsteroidDTO, FireballDTO, SolarFlareDTO } from '@/types';
import { Orbit, Flame, Sun, ChevronRight } from 'lucide-react';
import { RiskBadge } from '@/components/ui/RiskBadge';

export type TimelineEvent = {
  id: string;
  type: 'asteroid' | 'fireball' | 'solar';
  title: string;
  subtitle: string;
  riskLevel: string;
  timestamp: string;
  item: AsteroidDTO | FireballDTO | SolarFlareDTO;
};

type Props = {
  events: TimelineEvent[];
  onSelect: (item: TimelineEvent) => void;
};

const typeIcon = {
  asteroid: Orbit,
  fireball: Flame,
  solar: Sun,
};

const typeAccent = {
  asteroid: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
  fireball: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  solar: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
};

export default function EventTimeline({ events, onSelect }: Props) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-slate-500">
        No recent events to show yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 glass">
      <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Recent activity
      </h3>
      <div className="relative space-y-0">
        <div className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-violet-500/40 via-cyan-500/20 to-transparent" />
        {events.map((event, index) => {
          const Icon = typeIcon[event.type];
          return (
            <button
              key={event.id}
              onClick={() => onSelect(event)}
              className="group relative flex w-full items-start gap-4 rounded-xl px-2 py-3 text-left transition-colors hover:bg-white/[0.03]"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${typeAccent[event.type]}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">{event.title}</span>
                  <RiskBadge level={event.riskLevel} compact />
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{event.subtitle}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
              <ChevronRight
                size={14}
                className="mt-3 shrink-0 text-slate-600 transition-colors group-hover:text-violet-400"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
