'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AsteroidDTO, FireballDTO, SolarFlareDTO, DashboardDTO } from '@/types';
import { fetchDashboard } from '@/lib/api';
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
  Target
} from 'lucide-react';

// Dynamically import the map
const FireballMap = dynamic(() => import('@/components/FireballMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl h-[450px] flex items-center justify-center glass">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Loading Orbital Map...</p>
      </div>
    </div>
  ),
});

type View = 'dashboard' | 'asteroids' | 'fireballs' | 'solar-flares';

function RiskBadge({ level }: { level: string }) {
  const baseClasses = 'px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border';
  switch (level) {
    case 'CRITICAL': 
      return <span className={`${baseClasses} border-red-500/50 bg-red-500/10 text-red-500 pulse-critical`}>{level}</span>;
    case 'WATCH':    
      return <span className={`${baseClasses} border-amber-500/50 bg-amber-500/10 text-amber-500`}>{level}</span>;
    case 'SAFE':     
      return <span className={`${baseClasses} border-emerald-500/50 bg-emerald-500/10 text-emerald-500`}>{level}</span>;
    default:         
      return <span className={`${baseClasses} border-slate-500/50 bg-slate-500/10 text-slate-400`}>{level}</span>;
  }
}

function RiskMeter({ score }: { score: number }) {
  const percentage = Math.min(Math.max(score, 0), 10) * 10;
  const color = score >= 7 ? 'bg-red-500' : score >= 4 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-700 ease-out`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

function SidebarItem({ 
  active, 
  onClick, 
  icon: Icon, 
  label, 
  count 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string; 
  count?: number;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
        active 
          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
          active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function Home() {
  const [asteroids, setAsteroids] = useState<AsteroidDTO[]>([]);
  const [fireballs, setFireballs] = useState<FireballDTO[]>([]);
  const [mappableFireballs, setMappableFireballs] = useState<FireballDTO[]>([]);
  const [solarFlares, setSolarFlares] = useState<SolarFlareDTO[]>([]);
  const [summary, setSummary] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data: DashboardDTO = await fetchDashboard();
        setAsteroids(data.asteroids);
        setFireballs(data.fireballs);
        setMappableFireballs(data.mappableFireballs);
        setSolarFlares(data.solarFlares);
        setSummary(data);
      } catch (err) {
        setError('Failed to connect to Space Shield API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e17] grid-bg">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="text-cyan-500 animate-pulse" size={32} />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-cyan-500 font-mono text-sm tracking-[0.3em] uppercase">Initializing Scanners</p>
          <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    );
  }

  const hasCritical = (summary?.criticalEvents ?? 0) > 0;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-200 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d1424] border-r border-slate-800/50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
              <Shield className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">SPACE SHIELD</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${hasCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">System Active</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-4 mb-4">Monitoring</div>
            <SidebarItem 
              active={activeView === 'dashboard'} 
              onClick={() => { setActiveView('dashboard'); setSidebarOpen(false); }}
              icon={LayoutDashboard} 
              label="Dashboard" 
            />
            <SidebarItem 
              active={activeView === 'asteroids'} 
              onClick={() => { setActiveView('asteroids'); setSidebarOpen(false); }}
              icon={Orbit} 
              label="Asteroids" 
              count={summary?.totalAsteroids}
            />
            <SidebarItem 
              active={activeView === 'fireballs'} 
              onClick={() => { setActiveView('fireballs'); setSidebarOpen(false); }}
              icon={Flame} 
              label="Fireballs" 
              count={summary?.totalFireballs}
            />
            <SidebarItem 
              active={activeView === 'solar-flares'} 
              onClick={() => { setActiveView('solar-flares'); setSidebarOpen(false); }}
              icon={Sun} 
              label="Solar Flares" 
              count={summary?.totalSolarFlares}
            />
          </nav>

          <div className="p-4 border-t border-slate-800/50">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={16} className="text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Last Scan</span>
                  <span className="text-slate-300 font-mono">
                    {summary ? new Date(summary.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Threat Level</span>
                  <span className={hasCritical ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {hasCritical ? 'ELEVATED' : 'NOMINAL'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative grid-bg">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-[#0a0e17]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Shield className="text-cyan-400" size={20} />
            <span className="font-bold text-sm tracking-wider">SPACE SHIELD</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-white transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* View Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight capitalize flex items-center gap-3">
                  {activeView.replace('-', ' ')}
                  <div className="h-px w-12 bg-cyan-500/30 ml-2 hidden md:block"></div>
                </h2>
                <p className="text-slate-400 text-sm mt-1 max-w-md">
                  {activeView === 'dashboard' && "Global overview of current space threats and planetary security status."}
                  {activeView === 'asteroids' && "Real-time tracking of Near-Earth Objects (NEOs) detected within our planetary neighborhood."}
                  {activeView === 'fireballs' && "Monitoring atmospheric entry events and impact energy data from fireball sightings worldwide."}
                  {activeView === 'solar-flares' && "Space weather tracking of solar activity and its potential impact on planetary communications."}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
                <Clock size={14} className="text-slate-500" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Live Updates Enabled</span>
              </div>
            </div>

            {/* View Content */}
            <div className="fade-in">
              {activeView === 'dashboard' && (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard 
                      icon={Orbit} 
                      label="Total Asteroids" 
                      value={summary?.totalAsteroids ?? 0} 
                      color="text-cyan-400" 
                    />
                    <SummaryCard 
                      icon={Flame} 
                      label="Fireball Events" 
                      value={summary?.totalFireballs ?? 0} 
                      color="text-amber-400" 
                    />
                    <SummaryCard 
                      icon={Sun} 
                      label="Solar Activity" 
                      value={summary?.totalSolarFlares ?? 0} 
                      color="text-yellow-400" 
                    />
                    <SummaryCard 
                      icon={AlertTriangle} 
                      label="Critical Threats" 
                      value={summary?.criticalEvents ?? 0} 
                      color={hasCritical ? "text-red-500" : "text-emerald-500"} 
                      pulse={hasCritical}
                    />
                  </div>

                  {/* Map Section */}
                  <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl overflow-hidden glass">
                    <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapIcon size={18} className="text-cyan-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Orbital Threat Projection</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{mappableFireballs.length} Active Vectors</span>
                    </div>
                    <FireballMap fireballs={mappableFireballs} />
                  </div>

                  {/* Secondary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-6 glass">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-yellow-500" />
                        Solar Activity Analysis
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-slate-400">Significant Flares</span>
                          <span className="text-xl font-bold text-white">{summary?.significantSolarFlares ?? 0}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full w-[15%]" />
                        </div>
                        <p className="text-[10px] text-slate-500 italic">M-class and X-class flares currently being monitored for EM interference.</p>
                      </div>
                    </div>
                    <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-6 glass">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Target size={16} className="text-red-500" />
                        Risk Distribution
                      </h3>
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2 text-center p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                          <div className="text-[10px] text-red-400 font-bold uppercase">Critical</div>
                          <div className="text-2xl font-bold text-red-500">{summary?.criticalEvents ?? 0}</div>
                        </div>
                        <div className="flex-1 space-y-2 text-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <div className="text-[10px] text-amber-400 font-bold uppercase">Watch</div>
                          <div className="text-2xl font-bold text-amber-500">{summary?.watchEvents ?? 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'asteroids' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {asteroids.length === 0 ? (
                    <EmptyState message="No asteroids detected in recent scans" />
                  ) : (
                    asteroids.map((asteroid) => (
                      <DataCard key={asteroid.nasaId}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                              <Orbit size={20} className="text-cyan-400" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">{asteroid.name}</div>
                              <div className="text-[10px] font-mono text-slate-500">ID: {asteroid.nasaId}</div>
                            </div>
                          </div>
                          <RiskBadge level={asteroid.riskLevel} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <DataPoint label="Diameter" value={`${asteroid.diameterMinKm?.toFixed(2)} - ${asteroid.diameterMaxKm?.toFixed(2)} km`} />
                          <DataPoint label="Miss Distance" value={`${Number(asteroid.missDistanceKm).toLocaleString()} km`} />
                        </div>
                        <div className="space-y-1.5 pt-4 border-t border-slate-800/50">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-500">Risk Assessment</span>
                            <span className="text-slate-300 font-mono">{asteroid.riskScore}/10</span>
                          </div>
                          <RiskMeter score={asteroid.riskScore} />
                        </div>
                      </DataCard>
                    ))
                  )}
                </div>
              )}

              {activeView === 'fireballs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fireballs.length === 0 ? (
                    <EmptyState message="No fireball events recorded" />
                  ) : (
                    fireballs.map((fireball) => (
                      <DataCard key={fireball.id}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                              <Flame size={20} className="text-amber-400" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">Event #{fireball.id}</div>
                              <div className="text-[10px] font-mono text-slate-500">{fireball.eventDate}</div>
                            </div>
                          </div>
                          <RiskBadge level={fireball.riskLevel} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <DataPoint label="Total Energy" value={`${fireball.energyJoules?.toFixed(2)} ×10¹⁰ J`} />
                          <DataPoint label="Impact Energy" value={`${fireball.impactEnergyKt?.toFixed(2)} kt`} />
                        </div>
                        <div className="space-y-1.5 pt-4 border-t border-slate-800/50">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-500">Risk Assessment</span>
                            <span className="text-slate-300 font-mono">{fireball.riskScore}/10</span>
                          </div>
                          <RiskMeter score={fireball.riskScore} />
                        </div>
                      </DataCard>
                    ))
                  )}
                </div>
              )}

              {activeView === 'solar-flares' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solarFlares.length === 0 ? (
                    <EmptyState message="No solar activity detected" />
                  ) : (
                    solarFlares.map((flare) => (
                      <DataCard key={flare.flrId}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                              <Sun size={20} className="text-yellow-400" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">Class {flare.classType}</div>
                              <div className="text-[10px] font-mono text-slate-500">{flare.flrId}</div>
                            </div>
                          </div>
                          <RiskBadge level={flare.riskLevel} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <DataPoint label="Peak Time" value={flare.peakTime.split('T')[1]?.replace('Z', '') || flare.peakTime} />
                          <DataPoint label="Location" value={flare.sourceLocation || 'Unknown'} />
                        </div>
                        <div className="space-y-1.5 pt-4 border-t border-slate-800/50">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-500">Intensity Score</span>
                            <span className="text-slate-300 font-mono">{flare.riskScore}/10</span>
                          </div>
                          <RiskMeter score={flare.riskScore} />
                        </div>
                        {flare.riskReason && (
                          <div className="mt-3 text-[10px] text-slate-500 italic flex items-start gap-2">
                            <Info size={12} className="mt-0.5 shrink-0" />
                            {flare.riskReason}
                          </div>
                        )}
                      </DataCard>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, pulse }: { icon: any; label: string; value: number; color: string; pulse?: boolean }) {
  return (
    <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-5 glass relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Icon size={40} className={color} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50 ${pulse ? 'animate-pulse' : ''}`}>
          <Icon size={18} className={color} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
    </div>
  );
}

function DataCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300 group relative overflow-hidden glass">
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={14} className="text-cyan-500" />
      </div>
      {children}
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xs font-semibold text-slate-300">{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center border border-slate-800">
        <AlertTriangle size={24} className="text-slate-600" />
      </div>
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}
