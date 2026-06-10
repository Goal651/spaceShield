'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from 'react';
import React from 'react';
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
  Target,
  Maximize2,
  LucideIcon
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

// Dynamically import the 3D Earth
const Earth3D = dynamic(() => import('@/components/Earth3D'), {
  ssr: false,
  loading: () => (
    <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl h-[500px] flex items-center justify-center glass">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Booting 3D Engine...</p>
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
  icon: LucideIcon; 
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
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<AsteroidDTO | FireballDTO | SolarFlareDTO | null>(null);
  
  // Static bars for telemetry
  const telemetryBars = [45, 78, 23, 56, 89, 12, 44, 67, 34, 90, 15, 66, 32, 77, 10, 55, 88, 41, 29, 60];
  
  const getHash = (item: AsteroidDTO | FireballDTO | SolarFlareDTO | null) => {
    if (!item) return '';
    if ('nasaId' in item) return `AST-${item.nasaId}`;
    if ('flrId' in item) return `FLR-${item.flrId}`;
    if ('id' in item) return `EVT-${item.id}`;
    return 'SEC-01';
  };
  const detectionHash = getHash(selectedItem);

  const getName = (item: AsteroidDTO | FireballDTO | SolarFlareDTO | null) => {
    if (!item) return '';
    if ('name' in item) return item.name;
    if ('id' in item) return `Event #${item.id}`;
    if ('flrId' in item) return item.flrId;
    return 'Unknown Object';
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    async function loadData() {
      try {
        const dashboardData = await fetchDashboard();
        setData(dashboardData);
      } catch (err) {
        setError('Failed to connect to Space Shield API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] grid-bg">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="text-cyan-500 animate-pulse" size={32} />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-cyan-500 font-mono text-sm tracking-[0.3em] uppercase">Initializing Scanners</p>
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    );
  }

  const hasCritical = (data?.criticalEvents ?? 0) > 0;

  const handleCardClick = (item: AsteroidDTO | FireballDTO | SolarFlareDTO, view: View) => {
    setSelectedItem(item);
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#020617] border-r border-slate-900 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
              onClick={() => { setActiveView('dashboard'); setSidebarOpen(false); setSelectedItem(null); }}
              icon={LayoutDashboard} 
              label="Dashboard" 
            />
            <SidebarItem 
              active={activeView === 'asteroids'} 
              onClick={() => { setActiveView('asteroids'); setSidebarOpen(false); setSelectedItem(null); }}
              icon={Orbit} 
              label="Asteroids" 
              count={data?.totalAsteroids ?? 0}
            />
            <SidebarItem 
              active={activeView === 'fireballs'} 
              onClick={() => { setActiveView('fireballs'); setSidebarOpen(false); setSelectedItem(null); }}
              icon={Flame} 
              label="Fireballs" 
              count={data?.totalFireballs ?? 0}
            />
            <SidebarItem 
              active={activeView === 'solar-flares'} 
              onClick={() => { setActiveView('solar-flares'); setSidebarOpen(false); setSelectedItem(null); }}
              icon={Sun} 
              label="Solar Flares" 
              count={data?.totalSolarFlares ?? 0}
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
                    {data ? new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
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
                  {selectedItem ? 'Event Details' : activeView.replace('-', ' ')}
                  <div className="h-px w-12 bg-cyan-500/30 ml-2 hidden md:block"></div>
                </h2>
                <p className="text-slate-400 text-sm mt-1 max-w-md">
                  {selectedItem ? `Detailed analysis for ${getName(selectedItem)}` : (
                    activeView === 'dashboard' ? "Global overview of current space threats and planetary security status." :
                    activeView === 'asteroids' ? "Real-time tracking of Near-Earth Objects (NEOs) detected within our planetary neighborhood." :
                    activeView === 'fireballs' ? "Monitoring atmospheric entry events and impact energy data from fireball sightings worldwide." :
                    "Space weather tracking of solar activity and its potential impact on planetary communications."
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
                <Clock size={14} className="text-slate-500" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{currentTime}</span>
              </div>
            </div>

            {/* View Content */}
            <div className="fade-in">
              {selectedItem ? (
                <DetailView 
                  item={selectedItem} 
                  type={activeView} 
                  onBack={() => setSelectedItem(null)} 
                  telemetryBars={telemetryBars}
                  detectionHash={detectionHash}
                />
              ) : (
                <>
                  {activeView === 'dashboard' && (
                    <div className="space-y-6">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard 
                          icon={Orbit} 
                          label="Total Asteroids" 
                          value={data?.totalAsteroids ?? 0} 
                          color="text-cyan-400" 
                          onClick={() => setActiveView('asteroids')}
                        />
                        <SummaryCard 
                          icon={Flame} 
                          label="Fireball Events" 
                          value={data?.totalFireballs ?? 0} 
                          color="text-amber-400" 
                          onClick={() => setActiveView('fireballs')}
                        />
                        <SummaryCard 
                          icon={Sun} 
                          label="Solar Activity" 
                          value={data?.totalSolarFlares ?? 0} 
                          color="text-yellow-400" 
                          onClick={() => setActiveView('solar-flares')}
                        />
                        <SummaryCard 
                          icon={AlertTriangle} 
                          label="Critical Threats" 
                          value={data?.criticalEvents ?? 0} 
                          color={hasCritical ? "text-red-500" : "text-emerald-500"} 
                          pulse={hasCritical}
                        />
                      </div>

                      {/* Map Section */}
                  <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl overflow-hidden glass">
                    <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapIcon size={18} className="text-cyan-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Orbital Threat Projection (3D)</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{data?.mappableFireballs.length} Active Vectors</span>
                    </div>
                    <Earth3D fireballs={data?.mappableFireballs ?? []} />
                  </div>

                      {/* Recent Alerts Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-6 glass">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Zap size={16} className="text-yellow-500" />
                            Recent Solar Activity
                          </h3>
                          <div className="space-y-3">
                            {data?.solarFlares.slice(0, 3).map(flare => (
                              <button key={flare.flrId} onClick={() => handleCardClick(flare, 'solar-flares')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-yellow-500/30 transition-all text-left group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                    <Sun size={14} className="text-yellow-500" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-white">Class {flare.classType}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">{flare.flrId}</div>
                                  </div>
                                </div>
                                <ChevronRight size={14} className="text-slate-600 group-hover:text-yellow-500 transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-6 glass">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Target size={16} className="text-red-500" />
                            High Risk Asteroids
                          </h3>
                          <div className="space-y-3">
                            {data?.asteroids.filter(a => a.riskLevel !== 'SAFE').slice(0, 3).map(asteroid => (
                              <button key={asteroid.nasaId} onClick={() => handleCardClick(asteroid, 'asteroids')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/30 transition-all text-left group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                    <Orbit size={14} className="text-cyan-500" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-white truncate max-w-[120px]">{asteroid.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">Score: {asteroid.riskScore}/10</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <RiskBadge level={asteroid.riskLevel} />
                                  <ChevronRight size={14} className="text-slate-600 group-hover:text-cyan-500 transition-colors" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeView === 'asteroids' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data?.asteroids.length === 0 ? (
                        <EmptyState message="No asteroids detected in recent scans" />
                      ) : (
                        data?.asteroids.map((asteroid) => (
                          <DataCard key={asteroid.nasaId} onClick={() => handleCardClick(asteroid, 'asteroids')}>
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
                      {data?.fireballs.length === 0 ? (
                        <EmptyState message="No fireball events recorded" />
                      ) : (
                        data?.fireballs.map((fireball) => (
                          <DataCard key={fireball.id} onClick={() => handleCardClick(fireball, 'fireballs')}>
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
                      {data?.solarFlares.length === 0 ? (
                        <EmptyState message="No solar activity detected" />
                      ) : (
                        data?.solarFlares.map((flare) => (
                          <DataCard key={flare.flrId} onClick={() => handleCardClick(flare, 'solar-flares')}>
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
                          </DataCard>
                        ))
                      )}
                    </div>
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

function SummaryCard({ icon: Icon, label, value, color, pulse, onClick }: { icon: LucideIcon; label: string; value: number; color: string; pulse?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-5 glass relative overflow-hidden group hover:border-cyan-500/30 transition-all">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Icon size={40} className={color} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50 ${pulse ? 'animate-pulse' : ''}`}>
          <Icon size={18} className={color} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-500 transition-colors" />
      </div>
    </button>
  );
}

function DataCard({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300 group relative overflow-hidden glass">
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 size={14} className="text-cyan-500" />
      </div>
      {children}
    </button>
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

function DetailView({ 
  item, 
  type, 
  onBack, 
  telemetryBars, 
  detectionHash 
}: { 
  item: AsteroidDTO | FireballDTO | SolarFlareDTO, 
  type: View, 
  onBack: () => void, 
  telemetryBars: number[], 
  detectionHash: string 
}) {
  const getName = (i: AsteroidDTO | FireballDTO | SolarFlareDTO) => {
    if ('name' in i) return i.name;
    if ('id' in i) return `Event #${i.id}`;
    if ('flrId' in i) return `Class ${i.classType}`;
    return 'Unknown Object';
  };

  const getSubId = (i: AsteroidDTO | FireballDTO | SolarFlareDTO) => {
    if ('nasaId' in i) return i.nasaId;
    if ('flrId' in i) return i.flrId;
    return 'Atmospheric Entry';
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors">
        <ChevronRight size={14} className="rotate-180" />
        Back to Scans
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-8 glass space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50`}>
                  {type === 'asteroids' && <Orbit size={32} className="text-cyan-400" />}
                  {type === 'fireballs' && <Flame size={32} className="text-amber-400" />}
                  {type === 'solar-flares' && <Sun size={32} className="text-yellow-400" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{getName(item)}</h3>
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">{getSubId(item)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <RiskBadge level={item.riskLevel} />
                <span className="text-[10px] text-slate-500 font-mono">Detection Hash: {detectionHash}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-slate-800/50">
              {type === 'asteroids' && (
                <>
                  <DetailPoint label="Estimated Diameter" value={`${(item as AsteroidDTO).diameterMinKm?.toFixed(3)} - ${(item as AsteroidDTO).diameterMaxKm?.toFixed(3)} km`} />
                  <DetailPoint label="Velocity" value={`${(item as AsteroidDTO).velocityKmPerSec?.toFixed(2)} km/s`} />
                  <DetailPoint label="Miss Distance" value={`${Number((item as AsteroidDTO).missDistanceKm).toLocaleString()} km`} />
                  <DetailPoint label="Close Approach" value={new Date((item as AsteroidDTO).closeApproachDate).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                </>
              )}
              {type === 'fireballs' && (
                <>
                  <DetailPoint label="Event Date" value={(item as FireballDTO).eventDate} />
                  <DetailPoint label="Total Energy" value={`${(item as FireballDTO).energyJoules?.toFixed(2)} ×10¹⁰ Joules`} />
                  <DetailPoint label="Impact Energy" value={`${(item as FireballDTO).impactEnergyKt?.toFixed(2)} Kilotons`} />
                  <DetailPoint label="Altitude" value={(item as FireballDTO).altitudeKm ? `${(item as FireballDTO).altitudeKm?.toFixed(1)} km` : 'Data Unavailable'} />
                  <DetailPoint label="Coordinates" value={(item as FireballDTO).latitude ? `${(item as FireballDTO).latitude?.toFixed(4)}°, ${(item as FireballDTO).longitude?.toFixed(4)}°` : 'Location Not Triangulated'} />
                </>
              )}
              {type === 'solar-flares' && (
                <>
                  <DetailPoint label="Flare Class" value={(item as SolarFlareDTO).classType} />
                  <DetailPoint label="Source Location" value={(item as SolarFlareDTO).sourceLocation || 'Active Region Undefined'} />
                  <DetailPoint label="Begin Time" value={new Date((item as SolarFlareDTO).beginTime).toLocaleString()} />
                  <DetailPoint label="Peak Time" value={new Date((item as SolarFlareDTO).peakTime).toLocaleString()} />
                  <DetailPoint label="End Time" value={new Date((item as SolarFlareDTO).endTime).toLocaleString()} />
                </>
              )}
            </div>

            <div className="space-y-3 pt-8 border-t border-slate-800/50">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400">Risk Assessment Analysis</span>
                <span className="text-cyan-400 font-mono">{item.riskScore}/10</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className={`h-full ${item.riskScore >= 7 ? 'bg-red-500' : item.riskScore >= 4 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all duration-1000`} style={{ width: `${item.riskScore * 10}%` }} />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed italic mt-4">
                &quot;{item.riskReason || 'Preliminary orbital analysis suggests no immediate threat. Continued monitoring advised.'}&quot;
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1a2234]/40 border border-slate-800/50 rounded-2xl p-6 glass">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-cyan-500" />
              Real-time Telemetry
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500 uppercase">Tracking Status</span>
                <span className="text-emerald-500 uppercase font-bold">Active Lock</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500 uppercase">Data Integrity</span>
                <span className="text-cyan-500 uppercase font-bold">99.8% Verified</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500 uppercase">Signal Source</span>
                <span className="text-slate-300 uppercase">DSS-14 (Goldstone)</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800/50">
              <div className="h-20 flex items-end gap-1 px-1">
                {telemetryBars.map((height, i) => (
                  <div key={i} className="flex-1 bg-cyan-500/20 rounded-t-sm animate-pulse" style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Shield size={120} className="text-cyan-500" />
            </div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Planetary Defense</h4>
            <p className="text-[10px] text-cyan-500/80 leading-relaxed">
              Detection data is automatically forwarded to planetary defense networks. Response protocols remain in standby.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailPoint({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      <div className="text-lg font-semibold text-slate-200 tracking-tight">{value}</div>
    </div>
  );
}
