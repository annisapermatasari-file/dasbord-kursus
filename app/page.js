'use client'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, BarChart3, Instagram, Facebook, Youtube, Music2, Globe,
  FileText, Users, Heart, MessageSquareText, Megaphone, Trophy, Lightbulb,
  FileBarChart, Settings, ChevronLeft, ChevronRight, RefreshCw, ShieldCheck,
} from 'lucide-react'
import { PeriodFilter, PERIODS, MockDataBanner } from '@/components/dash/shared'
import {
  OverviewView, SocialMediaView, PlatformDetailView, WebsiteView,
  ContentView, AudienceView, EngagementView, SentimentView, CampaignView,
  BestContentView, RecommendationsView, ReportsView, SettingsView,
} from '@/components/dash/views'

const MENU = [
  { key:'overview', label:'Overview', icon: LayoutDashboard, title:'Ringkasan Performa Digital', desc:'Ringkasan performa seluruh kanal komunikasi digital Direktorat.' },
  { key:'social', label:'Social Media Performance', icon: BarChart3, title:'Social Media Performance', desc:'Perbandingan performa antar platform.' },
  { key:'instagram', label:'Instagram', icon: Instagram, title:'Instagram Analytics', desc:'Detail performa akun Instagram @kursuskita.' },
  { key:'facebook', label:'Facebook', icon: Facebook, title:'Facebook Analytics', desc:'Detail performa Halaman KursusKita.info.' },
  { key:'youtube', label:'YouTube', icon: Youtube, title:'YouTube Analytics', desc:'Detail performa channel @kursuskita1211.' },
  { key:'tiktok', label:'TikTok', icon: Music2, title:'TikTok Analytics', desc:'Detail performa akun TikTok @kursuskita.' },
  { key:'website', label:'Website', icon: Globe, title:'Website Analytics', desc:'kursus.kemendikdasmen.go.id — Google Analytics 4.' },
  { key:'content', label:'Content Analytics', icon: FileText, title:'Content Analytics', desc:'Analisis seluruh konten & Performance Score.' },
  { key:'audience', label:'Audience Analytics', icon: Users, title:'Audience Analytics', desc:'Demografi & perilaku audiens.' },
  { key:'engagement', label:'Engagement Analytics', icon: Heart, title:'Engagement Analytics', desc:'Analisis interaksi audiens.' },
  { key:'sentiment', label:'Sentiment Analysis', icon: MessageSquareText, title:'Sentiment Analysis', desc:'Persepsi publik dari komentar.' },
  { key:'campaign', label:'Campaign Performance', icon: Megaphone, title:'Campaign Analytics', desc:'Performa kampanye komunikasi.' },
  { key:'best', label:'Best Performing Content', icon: Trophy, title:'Best Performing Content', desc:'Ranking konten terbaik lintas platform.' },
  { key:'recommend', label:'Recommendations', icon: Lightbulb, title:'Recommendation Engine', desc:'Rekomendasi otomatis berbasis data.' },
  { key:'reports', label:'Reports', icon: FileBarChart, title:'Report Generator', desc:'Buat laporan Monthly/Quarterly/Annual/Executive.' },
  { key:'settings', label:'Settings', icon: Settings, title:'Settings & Admin Panel', desc:'Konfigurasi akun, API, users, dan organisasi.' },
]

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('overview')
  const [period, setPeriod] = useState('30')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  useEffect(() => { setLastUpdated(new Date()) }, [])
  const days = (PERIODS.find(p => p.key === period) || PERIODS[2]).days
  const current = MENU.find(m => m.key === active) || MENU[0]

  function handleRefresh() { setRefreshing(true); setTimeout(() => { setLastUpdated(new Date()); setRefreshing(false) }, 900) }

  return (
    <div className="min-h-screen flex bg-slate-50 print:bg-white">
      <aside className={`${collapsed ? 'w-[76px]' : 'w-[268px]'} transition-all duration-300 shrink-0 bg-[#0B2545] text-slate-100 flex flex-col sticky top-0 h-screen print:hidden`}>
        <div className="px-4 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 ring-1 ring-white/15"><ShieldCheck className="w-6 h-6 text-white" /></div>
          {!collapsed && <div className="min-w-0"><div className="text-[11px] uppercase tracking-wider text-blue-200/80">Direktorat</div><div className="text-sm font-semibold leading-tight truncate">Kursus &amp; Pelatihan</div></div>}
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {MENU.map(m => { const Icon = m.icon; const isActive = active === m.key; return (
            <button key={m.key} onClick={() => setActive(m.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${isActive ? 'bg-blue-500/95 text-white shadow-lg shadow-blue-900/30' : 'text-slate-200/85 hover:bg-white/5'}`} title={m.label}>
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate text-left flex-1">{m.label}</span>}
            </button>
          )})}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={() => setCollapsed(v => !v)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Ciutkan Menu</>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-5 print:hidden">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#1D4ED8] flex items-center justify-center ring-1 ring-slate-200 shadow-sm"><ShieldCheck className="w-7 h-7 text-white" /></div>
              <div>
                <h1 className="text-[22px] leading-tight font-bold text-slate-900 tracking-tight">Dashboard Media Sosial Direktorat Kursus dan Pelatihan</h1>
                <p className="text-sm text-slate-500 mt-1">Monitoring, Analisis, dan Evaluasi Komunikasi Digital &middot; <span className="italic">Data-driven Communication for Education</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Connected · Mock Data</div>
              <div className="text-xs text-slate-500 hidden md:block"><div>Terakhir diperbarui</div><div className="font-medium text-slate-700">{lastUpdated ? lastUpdated.toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' }) : '—'}</div></div>
              <button onClick={handleRefresh} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0B2545] text-white text-sm hover:bg-[#0e2f5c]"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh Data</button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{current.title}</h2>
              <p className="text-sm text-slate-500">{current.desc}</p>
            </div>
            {!['settings'].includes(active) && <PeriodFilter value={period} onChange={setPeriod} />}
          </div>

          {!['settings'].includes(active) && <div className="print:hidden"><MockDataBanner /></div>}

          {active==='overview' && <OverviewView days={days} />}
          {active==='social' && <SocialMediaView days={days} />}
          {['instagram','facebook','youtube','tiktok'].includes(active) && <PlatformDetailView platformKey={active} days={days} />}
          {active==='website' && <WebsiteView days={days} />}
          {active==='content' && <ContentView days={days} />}
          {active==='audience' && <AudienceView />}
          {active==='engagement' && <EngagementView days={days} />}
          {active==='sentiment' && <SentimentView days={days} />}
          {active==='campaign' && <CampaignView />}
          {active==='best' && <BestContentView days={days} />}
          {active==='recommend' && <RecommendationsView days={days} />}
          {active==='reports' && <ReportsView days={days} />}
          {active==='settings' && <SettingsView />}

          <footer className="pt-6 pb-2 text-center text-xs text-slate-400 print:hidden">© {new Date().getFullYear()} Direktorat Kursus dan Pelatihan — Kementerian Pendidikan Dasar dan Menengah</footer>
        </div>
      </main>
    </div>
  )
}
