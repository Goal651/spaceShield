'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo, useCallback } from 'react';
import React from 'react';
import { AsteroidDTO, FireballDTO, SolarFlareDTO, DashboardDTO } from '@/types';
import { fetchDashboard } from '@/lib/api';
import { plainThreatDescription } from '@/lib/threat';
import { RiskBadge, RiskMeter } from '@/components/ui/RiskBadge';
import EventTimeline, { TimelineEvent } from '@/components/EventTimeline';
import {
  Shield,
  Orbit,
  Flame,
  Sun,
  LayoutDashboard,
  AlertTriangle,
  Info,
  Activity,
  Clock,
  ChevronRight,
  Menu,
  X,
  Map as MapIcon,
  Zap,
  Target,
  Maximize2,
  BookOpen,
  RefreshCw,
  LucideIcon,
} from 'lucide-react';

const Earth3D = dynamic(() => import('@/components/Earth3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-2xl border border-white/5 glass">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />
        <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Loading globe…</p>
      </div>
    </div>
  ),
});

type View = 'dashboard' | 'asteroids' | 'fireballs' | 'solar-flares';

function SidebarItem({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
        active
          ? 'border border-violet-500/30 bg-violet-500/10 text-violet-300'
          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={18}
          className={active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span
          className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
            active ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function buildTimeline(data: DashboardDTO): TimelineEvent[] {
  const events: TimelineEvent[] = [
    ...data.asteroids.map((a) => ({
      id: `ast-${a.nasaId}`,
      type: 'asteroid' as const,
      title: a.name,
      subtitle: `${Number(a.missDistanceKm).toLocaleString()} km away`,
      riskLevel: a.riskLevel,
      timestamp: a.ingestedAt || a.closeApproachDate,
      item: a,
    })),
    ...data.fireballs.map((f) => ({
      id: `fb-${f.id}`,
      type: 'fireball' as const,
      title: `Fireball #${f.id}`,
      subtitle: f.impactEnergyKt ? `${f.impactEnergyKt.toFixed(1)} kt energy` : 'Atmospheric entry',
      riskLevel: f.riskLevel,
      timestamp: f.ingestedAt || f.eventDate,
      item: f,
    })),
    ...data.solarFlares.map((s) => ({
      id: `sol-${s.flrId}`,
      type: 'solar' as const,
      title: `Class ${s.classType} flare`,
      subtitle: s.sourceLocation || 'Solar activity',
      riskLevel: s.riskLevel,
      timestamp: s.ingestedAt || s.peakTime,
      item: s,
    })),
  ];

  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
}

export default function Home() {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [selectedItem, setSelectedItem] = useState<AsteroidDTO | FireballDTO | SolarFlareDTO | null>(null);

  const telemetryBars = [45, 78, 23, 56, 89, 12, 44, 67, 34, 90, 15, 66, 32, 77, 10, 55, 88, 41, 29, 60];

  const timeline = useMemo(() => (data ? buildTimeline(data) : []), [data]);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const dashboardData = await fetchDashboard();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError('Could not reach SpaceShield — is the backend running on port 8080?');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    loadData();
    const interval = setInterval(() => loadData(true), 10_000);
    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, [loadData]);

  const getName = (item: AsteroidDTO | FireballDTO | SolarFlareDTO | null) => {
    if (!item) return '';
    if ('name' in item) return item.name;
    if ('id' in item) return `Event #${item.id}`;
    if ('flrId' in item) return `Class ${item.classType}`;
    return 'Unknown';
  };

  const handleCardClick = (item: AsteroidDTO | FireballDTO | SolarFlareDTO, view: View) => {
    setSelectedItem(item);
    setActiveView(view);
  };

  const handleTimelineSelect = (event: TimelineEvent) => {
    const viewMap = { asteroid: 'asteroids', fireball: 'fireballs', solar: 'solar-flares' } as const;
    handleCardClick(event.item, viewMap[event.type]);
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="aurora-bg" />
        <div className="relative z-10 mb-8">
          <div className="h-24 w-24 animate-spin rounded-full border-2 border-violet-500/10 border-t-violet-400" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="animate-pulse text-violet-400" size={36} />
          </div>
        </div>
        <div className="relative z-10 space-y-3 text-center">
          <p className="gradient-text font-mono text-sm uppercase tracking-[0.35em]">SpaceShield</p>
          <p className="text-sm text-slate-500">Connecting to NASA data feeds…</p>
          <div className="mx-auto h-1 w-52 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-2/5 animate-[loading_2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-violet-600 to-cyan-400" />
          </div>
        </div>
      </div>
    );
  }

  const hasCritical = (data?.criticalEvents ?? 0) > 0;

  return (
    <div className="relative flex min-h-screen overflow-hidden text-slate-200">
      <div className="aurora-bg" />

      {/* Sidebar */}
      <aside
        className={`glass-strong fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/5 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 glow-violet">
              <Shield className="text-violet-400" size={22} />
            </div>
            <div>
              <h1 className="gradient-text text-lg font-bold tracking-tight">SpaceShield</h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <div
                  className={`live-dot h-1.5 w-1.5 rounded-full ${
                    hasCritical ? 'bg-rose-400' : 'bg-emerald-400'
                  }`}
                />
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {hasCritical ? 'Elevated' : 'Nominal'}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-4 py-2">
            <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              Explore
            </p>
            <SidebarItem
              active={activeView === 'dashboard'}
              onClick={() => {
                setActiveView('dashboard');
                setSidebarOpen(false);
                setSelectedItem(null);
              }}
              icon={LayoutDashboard}
              label="Overview"
            />
            <SidebarItem
              active={activeView === 'asteroids'}
              onClick={() => {
                setActiveView('asteroids');
                setSidebarOpen(false);
                setSelectedItem(null);
              }}
              icon={Orbit}
              label="Asteroids"
              count={data?.totalAsteroids ?? 0}
            />
            <SidebarItem
              active={activeView === 'fireballs'}
              onClick={() => {
                setActiveView('fireballs');
                setSidebarOpen(false);
                setSelectedItem(null);
              }}
              icon={Flame}
              label="Fireballs"
              count={data?.totalFireballs ?? 0}
            />
            <SidebarItem
              active={activeView === 'solar-flares'}
              onClick={() => {
                setActiveView('solar-flares');
                setSidebarOpen(false);
                setSelectedItem(null);
              }}
              icon={Sun}
              label="Solar weather"
              count={data?.totalSolarFlares ?? 0}
            />
          </nav>

          <div className="border-t border-white/5 p-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Live feed
                </span>
                {refreshing && <RefreshCw size={12} className="animate-spin text-violet-400" />}
              </div>
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Last update</span>
                  <span className="font-mono text-slate-300">
                    {data
                      ? new Date(data.lastUpdated).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : '--:--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Refresh</span>
                  <span className="text-cyan-400">Every 10s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col grid-bg">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#05040c]/80 px-6 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <Shield className="text-violet-400" size={20} />
            <span className="text-sm font-bold tracking-wide">SpaceShield</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-6xl space-y-8">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                <AlertTriangle className="mt-0.5 shrink-0 text-rose-400" size={18} />
                <div>
                  <p className="text-sm font-medium text-rose-200">{error}</p>
                  <button
                    onClick={() => loadData()}
                    className="mt-2 text-xs font-semibold text-rose-400 underline-offset-2 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="flex items-center gap-3 text-3xl font-bold capitalize tracking-tight text-white">
                  {selectedItem ? 'Event details' : activeView.replace('-', ' ')}
                  <span className="hidden h-px w-16 bg-gradient-to-r from-violet-500/50 to-transparent md:block" />
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
                  {selectedItem
                    ? `What you need to know about ${getName(selectedItem)}`
                    : activeView === 'dashboard'
                      ? 'A simple snapshot of what is happening in space near Earth right now.'
                      : activeView === 'asteroids'
                        ? 'Rocks flying past our planet — how close, how fast, and should you worry?'
                        : activeView === 'fireballs'
                          ? 'Bright meteors burning up in our atmosphere, seen from the ground.'
                          : 'Bursts of energy from the Sun that can affect satellites and radio signals.'}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5">
                <Clock size={14} className="text-slate-500" />
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                  {currentTime}
                </span>
              </div>
            </div>

            <div className="fade-in">
              {selectedItem ? (
                <DetailView item={selectedItem} type={activeView} onBack={() => setSelectedItem(null)} telemetryBars={telemetryBars} />
              ) : (
                <>
                  {activeView === 'dashboard' && (
                    <div className="space-y-6">
                      {/* Educational banner */}
                      <div className="card-shine relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/5 p-6 glow-violet">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10">
                              <BookOpen className="text-violet-400" size={22} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">Made for everyone</h3>
                              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">
                                SpaceShield turns NASA data into plain language.{' '}
                                <span className="text-emerald-400">All clear</span> means relax,{' '}
                                <span className="text-amber-400">worth watching</span> means scientists
                                are tracking it, and{' '}
                                <span className="text-rose-400">needs attention</span> means it is
                                unusually significant.
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <RiskBadge level="SAFE" />
                            <RiskBadge level="WATCH" />
                            <RiskBadge level="CRITICAL" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryCard
                          icon={Orbit}
                          label="Asteroids tracked"
                          value={data?.totalAsteroids ?? 0}
                          accent="violet"
                          onClick={() => setActiveView('asteroids')}
                        />
                        <SummaryCard
                          icon={Flame}
                          label="Fireball events"
                          value={data?.totalFireballs ?? 0}
                          accent="orange"
                          onClick={() => setActiveView('fireballs')}
                        />
                        <SummaryCard
                          icon={Sun}
                          label="Solar flares"
                          value={data?.totalSolarFlares ?? 0}
                          accent="amber"
                          onClick={() => setActiveView('solar-flares')}
                        />
                        <SummaryCard
                          icon={AlertTriangle}
                          label="High priority"
                          value={data?.criticalEvents ?? 0}
                          accent={hasCritical ? 'rose' : 'safe'}
                          pulse={hasCritical}
                        />
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-white/5 glass glow-violet">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-4">
                          <div className="flex items-center gap-3">
                            <MapIcon size={18} className="text-violet-400" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                              Global view
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Live
                            </span>
                            <span className="text-slate-700">·</span>
                            <span>
                              {data?.asteroids.length || 0} asteroids · {data?.fireballs.length || 0}{' '}
                              fireballs · {data?.solarFlares.length || 0} flares
                            </span>
                          </div>
                        </div>
                        {data && (
                          <Earth3D
                            asteroids={data.asteroids}
                            fireballs={data.mappableFireballs}
                            solarFlares={data.solarFlares}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-3">
                          <EventTimeline events={timeline} onSelect={handleTimelineSelect} />
                        </div>
                        <div className="space-y-6 lg:col-span-2">
                          <AlertPanel
                            title="Solar activity"
                            icon={Zap}
                            iconColor="text-amber-400"
                            items={data?.solarFlares.slice(0, 3) ?? []}
                            renderItem={(flare) => (
                              <button
                                key={flare.flrId}
                                onClick={() => handleCardClick(flare, 'solar-flares')}
                                className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-amber-500/30"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
                                    <Sun size={14} className="text-amber-400" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-white">Class {flare.classType}</div>
                                    <div className="text-[10px] text-slate-500">{flare.riskReason?.slice(0, 48)}…</div>
                                  </div>
                                </div>
                                <ChevronRight size={14} className="text-slate-600 group-hover:text-amber-400" />
                              </button>
                            )}
                          />
                          <AlertPanel
                            title="Closer asteroids"
                            icon={Target}
                            iconColor="text-violet-400"
                            items={data?.asteroids.filter((a) => a.riskLevel !== 'SAFE').slice(0, 3) ?? []}
                            renderItem={(asteroid) => (
                              <button
                                key={asteroid.nasaId}
                                onClick={() => handleCardClick(asteroid, 'asteroids')}
                                className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-violet-500/30"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
                                    <Orbit size={14} className="text-violet-400" />
                                  </div>
                                  <div>
                                    <div className="max-w-[130px] truncate text-xs font-bold text-white">
                                      {asteroid.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {Number(asteroid.missDistanceKm).toLocaleString()} km away
                                    </div>
                                  </div>
                                </div>
                                <RiskBadge level={asteroid.riskLevel} compact />
                              </button>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeView === 'asteroids' && (
                    <EventGrid
                      empty="No asteroids in the latest scan"
                      items={data?.asteroids ?? []}
                      render={(asteroid) => (
                        <DataCard key={asteroid.nasaId} onClick={() => handleCardClick(asteroid, 'asteroids')}>
                          <CardHeader
                            icon={Orbit}
                            iconClass="text-violet-400"
                            title={asteroid.name}
                            subtitle={`ID ${asteroid.nasaId}`}
                            riskLevel={asteroid.riskLevel}
                          />
                          <div className="mb-4 grid grid-cols-2 gap-4">
                            <DataPoint
                              label="Size"
                              value={`${asteroid.diameterMinKm?.toFixed(2)}–${asteroid.diameterMaxKm?.toFixed(2)} km`}
                            />
                            <DataPoint
                              label="Closest approach"
                              value={`${Number(asteroid.missDistanceKm).toLocaleString()} km`}
                            />
                          </div>
                          {asteroid.riskReason && (
                            <p className="mb-4 text-xs leading-relaxed text-slate-500">{asteroid.riskReason}</p>
                          )}
                          <RiskFooter score={asteroid.riskScore} />
                        </DataCard>
                      )}
                    />
                  )}

                  {activeView === 'fireballs' && (
                    <EventGrid
                      empty="No fireballs recorded yet"
                      items={data?.fireballs ?? []}
                      render={(fireball) => (
                        <DataCard key={fireball.id} onClick={() => handleCardClick(fireball, 'fireballs')}>
                          <CardHeader
                            icon={Flame}
                            iconClass="text-orange-400"
                            title={`Event #${fireball.id}`}
                            subtitle={fireball.eventDate}
                            riskLevel={fireball.riskLevel}
                          />
                          <div className="mb-4 grid grid-cols-2 gap-4">
                            <DataPoint label="Energy released" value={`${fireball.impactEnergyKt?.toFixed(2)} kt`} />
                            <DataPoint
                              label="When"
                              value={new Date(fireball.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            />
                          </div>
                          {fireball.riskReason && (
                            <p className="mb-4 text-xs leading-relaxed text-slate-500">{fireball.riskReason}</p>
                          )}
                          <RiskFooter score={fireball.riskScore} />
                        </DataCard>
                      )}
                    />
                  )}

                  {activeView === 'solar-flares' && (
                    <EventGrid
                      empty="No solar activity detected"
                      items={data?.solarFlares ?? []}
                      render={(flare) => (
                        <DataCard key={flare.flrId} onClick={() => handleCardClick(flare, 'solar-flares')}>
                          <CardHeader
                            icon={Sun}
                            iconClass="text-amber-400"
                            title={`Class ${flare.classType}`}
                            subtitle={flare.flrId}
                            riskLevel={flare.riskLevel}
                          />
                          <div className="mb-4 grid grid-cols-2 gap-4">
                            <DataPoint
                              label="Peak time"
                              value={new Date(flare.peakTime).toLocaleString(undefined, {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            />
                            <DataPoint label="On the Sun" value={flare.sourceLocation || 'Unknown region'} />
                          </div>
                          {flare.riskReason && (
                            <p className="mb-4 text-xs leading-relaxed text-slate-500">{flare.riskReason}</p>
                          )}
                          <RiskFooter score={flare.riskScore} />
                        </DataCard>
                      )}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

const accentMap = {
  violet: { text: 'text-violet-400', border: 'hover:border-violet-500/30', bg: 'from-violet-600/10' },
  orange: { text: 'text-orange-400', border: 'hover:border-orange-500/30', bg: 'from-orange-600/10' },
  amber: { text: 'text-amber-400', border: 'hover:border-amber-500/30', bg: 'from-amber-600/10' },
  rose: { text: 'text-rose-400', border: 'hover:border-rose-500/30', bg: 'from-rose-600/10' },
  safe: { text: 'text-emerald-400', border: 'hover:border-emerald-500/30', bg: 'from-emerald-600/10' },
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
  pulse,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  accent: keyof typeof accentMap;
  pulse?: boolean;
  onClick?: () => void;
}) {
  const a = accentMap[accent];
  return (
    <button
      onClick={onClick}
      className={`card-shine group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${a.bg} to-transparent p-5 text-left glass transition-all ${a.border}`}
    >
      <Icon size={48} className={`absolute -right-2 -top-2 opacity-[0.07] ${a.text}`} />
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] ${pulse ? 'animate-pulse' : ''}`}
        >
          <Icon size={18} className={a.text} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {onClick && (
          <ChevronRight size={16} className="text-slate-600 transition-colors group-hover:text-violet-400" />
        )}
      </div>
    </button>
  );
}

function AlertPanel<T>({
  title,
  icon: Icon,
  iconColor,
  items,
  renderItem,
}: {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 p-5 glass">
      <h3 className={`mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white`}>
        <Icon size={16} className={iconColor} />
        {title}
      </h3>
      <div className="space-y-2">{items.map(renderItem)}</div>
    </div>
  );
}

function EventGrid<T>({ items, empty, render }: { items: T[]; empty: string; render: (item: T) => React.ReactNode }) {
  if (items.length === 0) return <EmptyState message={empty} />;
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{items.map(render)}</div>;
}

function DataCard({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card-shine group relative w-full overflow-hidden rounded-2xl border border-white/5 p-5 text-left glass transition-all hover:border-violet-500/25"
    >
      <Maximize2
        size={14}
        className="absolute right-4 top-4 text-violet-400 opacity-0 transition-opacity group-hover:opacity-100"
      />
      {children}
    </button>
  );
}

function CardHeader({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  riskLevel,
}: {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  subtitle: string;
  riskLevel: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03]">
          <Icon size={20} className={iconClass} />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{title}</div>
          <div className="font-mono text-[10px] text-slate-500">{subtitle}</div>
        </div>
      </div>
      <RiskBadge level={riskLevel} />
    </div>
  );
}

function RiskFooter({ score }: { score: number }) {
  return (
    <div className="space-y-1.5 border-t border-white/5 pt-4">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-slate-500">Threat level</span>
        <span className="font-mono text-slate-300">{score}/100</span>
      </div>
      <RiskMeter score={score} />
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
      <div className="text-xs font-semibold text-slate-300">{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center space-y-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/5 bg-white/[0.02]">
        <Info size={24} className="text-slate-600" />
      </div>
      <p className="font-medium text-slate-500">{message}</p>
    </div>
  );
}

function DetailView({
  item,
  type,
  onBack,
  telemetryBars,
}: {
  item: AsteroidDTO | FireballDTO | SolarFlareDTO;
  type: View;
  onBack: () => void;
  telemetryBars: number[];
}) {
  const getName = (i: AsteroidDTO | FireballDTO | SolarFlareDTO) => {
    if ('name' in i) return i.name;
    if ('id' in i) return `Event #${i.id}`;
    if ('flrId' in i) return `Class ${i.classType}`;
    return 'Unknown';
  };

  const getSubId = (i: AsteroidDTO | FireballDTO | SolarFlareDTO) => {
    if ('nasaId' in i) return i.nasaId;
    if ('flrId' in i) return i.flrId;
    return 'Atmospheric entry';
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-400 transition-colors hover:text-violet-300"
      >
        <ChevronRight size={14} className="rotate-180" />
        Back
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-8 rounded-2xl border border-white/5 p-8 glass">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
                  {type === 'asteroids' && <Orbit size={32} className="text-violet-400" />}
                  {type === 'fireballs' && <Flame size={32} className="text-orange-400" />}
                  {type === 'solar-flares' && <Sun size={32} className="text-amber-400" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">{getName(item)}</h3>
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500">{getSubId(item)}</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <RiskBadge level={item.riskLevel} />
                <span className="text-xs text-slate-500">{plainThreatDescription(item.riskLevel)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 border-t border-white/5 pt-8 sm:grid-cols-2">
              {type === 'asteroids' && (
                <>
                  <DetailPoint
                    label="How big is it?"
                    value={`${(item as AsteroidDTO).diameterMinKm?.toFixed(3)} – ${(item as AsteroidDTO).diameterMaxKm?.toFixed(3)} km wide`}
                  />
                  <DetailPoint
                    label="How fast?"
                    value={`${(item as AsteroidDTO).velocityKmPerSec?.toFixed(2)} km/s`}
                  />
                  <DetailPoint
                    label="How close will it get?"
                    value={`${Number((item as AsteroidDTO).missDistanceKm).toLocaleString()} km from Earth`}
                  />
                  <DetailPoint
                    label="When?"
                    value={new Date((item as AsteroidDTO).closeApproachDate).toLocaleDateString(undefined, {
                      dateStyle: 'long',
                    })}
                  />
                </>
              )}
              {type === 'fireballs' && (
                <>
                  <DetailPoint label="When" value={(item as FireballDTO).eventDate} />
                  <DetailPoint
                    label="Energy released"
                    value={`${(item as FireballDTO).impactEnergyKt?.toFixed(2)} kilotons`}
                  />
                  <DetailPoint
                    label="Altitude"
                    value={
                      (item as FireballDTO).altitudeKm
                        ? `${(item as FireballDTO).altitudeKm?.toFixed(1)} km up`
                        : 'Not recorded'
                    }
                  />
                  <DetailPoint
                    label="Where"
                    value={
                      (item as FireballDTO).latitude
                        ? `${(item as FireballDTO).latitude?.toFixed(2)}°, ${(item as FireballDTO).longitude?.toFixed(2)}°`
                        : 'Location unknown'
                    }
                  />
                </>
              )}
              {type === 'solar-flares' && (
                <>
                  <DetailPoint label="Flare class" value={(item as SolarFlareDTO).classType} />
                  <DetailPoint
                    label="On the Sun"
                    value={(item as SolarFlareDTO).sourceLocation || 'Unknown region'}
                  />
                  <DetailPoint
                    label="Started"
                    value={new Date((item as SolarFlareDTO).beginTime).toLocaleString()}
                  />
                  <DetailPoint
                    label="Peaked"
                    value={new Date((item as SolarFlareDTO).peakTime).toLocaleString()}
                  />
                </>
              )}
            </div>

            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-violet-400" />
                <span className="text-sm font-bold text-white">What does this mean?</span>
              </div>
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                <p className="text-sm leading-relaxed text-slate-300">
                  {item.riskReason ||
                    'Scientists are still analyzing this event. Check back soon for an updated explanation.'}
                </p>
              </div>
              <RiskMeter score={item.riskScore} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 p-6 glass">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
              <Activity size={14} className="text-cyan-400" />
              Signal strength
            </h4>
            <div className="flex h-20 items-end gap-1">
              {telemetryBars.map((height, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-600/30 to-cyan-400/60"
                  style={{ height: `${height}%`, animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
            <Shield size={100} className="absolute -bottom-6 -right-6 text-cyan-500 opacity-[0.06]" />
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-400">Good to know</h4>
            <p className="text-xs leading-relaxed text-cyan-200/70">
              All data comes from public NASA feeds. Risk labels are simplified so anyone can understand what
              is happening — no astrophysics degree required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
      <div className="text-lg font-semibold tracking-tight text-slate-200">{value}</div>
    </div>
  );
}
