'use client'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, BarChart3, Instagram, Facebook, Youtube, Music2, Globe,
  FileText, Users, Heart, MessageSquareText, Megaphone, Trophy, Lightbulb,
  FileBarChart, Settings, ChevronLeft, ChevronRight, RefreshCw, ShieldCheck,
  LogOut, User, Crown, Calendar as CalendarIcon, GitCompareArrows,
} from 'lucide-react'
import { PeriodFilter, PERIODS, MockDataBanner } from '@/components/dash/shared'
import {
  OverviewView, SocialMediaView, PlatformDetailView, WebsiteView,
  ContentView, AudienceView, EngagementView, SentimentView, CampaignView,
  BestContentView, RecommendationsView, ReportsView, SettingsView,
  ExecutiveSummaryView, ContentCalendarView, ComparePeriodView,
} from '@/components/dash/views'
import LandingScreen from '@/components/marketing/LandingScreen'

const MENU = [
  { key:'overview', label:'Overview', icon: LayoutDashboard, title:'Ringkasan Performa Digital', desc:'Ringkasan performa seluruh kanal komunikasi digital Direktorat.' },
  { key:'executive', label:'Executive Summary', icon: Crown, title:'Executive Summary', desc:'Ringkasan performa digital khusus pimpinan.', highlight:true },
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
  { key:'calendar', label:'Content Calendar', icon: CalendarIcon, title:'Content Calendar', desc:'Kalender editorial — rencanakan dan tandai konten yang akan tayang.' },
  { key:'compare', label:'Compare Periode', icon: GitCompareArrows, title:'Compare Periode', desc:'Bandingkan performa periode ini vs periode sebelumnya secara side-by-side.' },
  { key:'recommend', label:'Recommendations', icon: Lightbulb, title:'Recommendation Engine', desc:'Rekomendasi otomatis berbasis data.' },
  { key:'reports', label:'Reports', icon: FileBarChart, title:'Report Generator', desc:'Buat laporan Monthly/Quarterly/Annual/Executive.' },
  { key:'settings', label:'Settings', icon: Settings, title:'Settings & Admin Panel', desc:'Konfigurasi akun, API, users, dan organisasi.' },
]

const ROLES = {
  Admin:    { color:'#DC2626', desc:'Akses penuh — kelola pengguna, API, dan semua data', allow:'*' },
  Analyst:  { color:'#2563EB', desc:'Melihat semua data & generate laporan', allow: MENU.filter(m => m.key !== 'settings').map(m => m.key) },
  Executive:{ color:'#D97706', desc:'Ringkasan eksekutif & laporan untuk pimpinan', allow: ['overview','executive','best','recommend','sentiment','reports'] },
  Viewer:   { color:'#64748B', desc:'Melihat dashboard performa dasar saja', allow: ['overview','social','instagram','facebook','youtube','tiktok','website'] },
}

// Fitur yang tersedia per paket berlangganan — dikombinasikan dengan hak akses role.
const PLANS = {
  starter:  { label:'Starter',  allow: ['overview','social','instagram','facebook','youtube','tiktok','website','content','settings'] },
  business: { label:'Business', allow: ['overview','social','instagram','facebook','youtube','tiktok','website','content','settings','audience','engagement','sentiment','campaign','best','calendar','compare','recommend','reports','executive'] },
  agency:   { label:'Agency',   allow: '*' },
}

const PRESET_USERS = [
  { name:'Annisa Permatasari', role:'Admin',     initial:'AP', jabatan:'Kepala Sub-Bagian Humas',            email:'annisa.permatasari@dikdasmen.belajar.id', password:'Admin@2026' },
  { name:'Rina Setiawati',     role:'Analyst',   initial:'RS', jabatan:'Analis Komunikasi Digital',          email:'rina.setiawati@dikdasmen.belajar.id',     password:'Analyst@2026' },
  { name:'Budi Santosa',       role:'Executive', initial:'BS', jabatan:'Direktur Kursus dan Pelatihan',      email:'budi.santosa@dikdasmen.belajar.id',       password:'Executive@2026' },
  { name:'Dewi Rahayu',        role:'Viewer',    initial:'DR', jabatan:'Staf Publikasi',                     email:'dewi.rahayu@dikdasmen.belajar.id',        password:'Viewer@2026' },
]

function hasAccess(role, plan, key) {
  const r = ROLES[role]; if (!r) return false
  const roleOk = r.allow === '*' || r.allow.includes(key)
  const p = PLANS[plan] || PLANS.starter
  const planOk = p.allow === '*' || p.allow.includes(key)
  return roleOk && planOk
}

export default function App({ searchParams }) {
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('overview')
  const [period, setPeriod] = useState('30')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [user, setUser] = useState(null) // {name, role, initial, jabatan}

  useEffect(() => {
    setLastUpdated(new Date())
    try { const saved = localStorage.getItem('dashboard_user'); if (saved) setUser(JSON.parse(saved)) } catch {}
  }, [])

  function logout() { setUser(null); try { localStorage.removeItem('dashboard_user') } catch {}; setActive('overview') }

  if (!user) return <LandingScreen searchParams={searchParams} />

  const days = (PERIODS.find(p => p.key === period) || PERIODS[2]).days
  const visibleMenu = MENU.filter(m => hasAccess(user.role, user.plan, m.key))
  const current = visibleMenu.find(m => m.key === active) || visibleMenu[0]
  const activeKey = current?.key || 'overview'

  function handleRefresh() { setRefreshing(true); setTimeout(() => { setLastUpdated(new Date()); setRefreshing(false) }, 900) }

  return (
    <div className="min-h-screen flex bg-slate-50 print:bg-white">
      <aside className={`${collapsed ? 'w-[76px]' : 'w-[268px]'} transition-all duration-300 shrink-0 bg-slate-900 text-slate-100 flex flex-col sticky top-0 h-screen print:hidden`}>
        <div className="px-4 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><path d="M4 16.5 9.5 11l4 3L20 6" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14.5 6H20v5.5" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          {!collapsed && <div className="min-w-0 text-sm font-semibold leading-tight truncate">SocialPulse</div>}
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {visibleMenu.map(m => { const Icon = m.icon; const isActive = activeKey === m.key; return (
            <button key={m.key} onClick={() => setActive(m.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${isActive ? 'bg-blue-600 text-white' : 'text-slate-200/85 hover:bg-white/5'}
                ${m.highlight && !isActive ? 'ring-1 ring-amber-400/30 bg-amber-500/5' : ''}`} title={m.label}>
              <Icon className={`w-[18px] h-[18px] shrink-0 ${m.highlight && !isActive ? 'text-amber-300' : ''}`} />
              {!collapsed && <span className="truncate text-left flex-1">{m.label}</span>}
              {!collapsed && m.highlight && <span className="text-[8px] uppercase font-bold tracking-wider text-amber-300">VIP</span>}
            </button>
          )})}
        </nav>

        {/* User card */}
        {!collapsed && (
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: ROLES[user.role]?.color }}>{user.initial}</div>
              <div className="min-w-0 flex-1"><div className="text-xs font-semibold truncate">{user.name}</div><div className="text-[10px] text-blue-200/70 truncate">{user.role} · {user.jabatan}</div></div>
              <button onClick={logout} title="Keluar" className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-slate-300"><LogOut className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
        <div className="p-3 border-t border-white/10">
          <button onClick={() => setCollapsed(v => !v)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Ciutkan Menu</>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {/* Print-only official kop */}
        <PrintKop />

        <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-5 print:hidden">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center ring-1 ring-slate-200 shadow-sm"><ShieldCheck className="w-7 h-7 text-white" /></div>
              <div>
                <h1 className="text-[22px] leading-tight font-bold text-slate-900 tracking-tight">SocialPulse Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Monitoring, Analisis, dan Evaluasi Komunikasi Digital &middot; <span className="italic">Data-driven Communication for Education</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: ROLES[user.role]?.color }}>
                <User className="w-3.5 h-3.5" />{user.role}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Connected · Mock Data</div>
              <div className="text-xs text-slate-500 hidden md:block"><div>Terakhir diperbarui</div><div className="font-medium text-slate-700">{lastUpdated ? lastUpdated.toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' }) : '—'}</div></div>
              <button onClick={handleRefresh} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh Data</button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6 print:p-0">
          <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{current.title}</h2>
              <p className="text-sm text-slate-500">{current.desc}</p>
            </div>
            {!['settings','calendar'].includes(activeKey) && <PeriodFilter value={period} onChange={setPeriod} />}
          </div>

          {!['settings','executive','calendar'].includes(activeKey) && <div className="print:hidden"><MockDataBanner /></div>}

          {activeKey==='overview' && <OverviewView days={days} />}
          {activeKey==='executive' && <ExecutiveSummaryView days={days} />}
          {activeKey==='social' && <SocialMediaView days={days} />}
          {['instagram','facebook','youtube','tiktok'].includes(activeKey) && <PlatformDetailView platformKey={activeKey} days={days} />}
          {activeKey==='website' && <WebsiteView days={days} />}
          {activeKey==='content' && <ContentView days={days} />}
          {activeKey==='audience' && <AudienceView />}
          {activeKey==='engagement' && <EngagementView days={days} />}
          {activeKey==='sentiment' && <SentimentView days={days} />}
          {activeKey==='campaign' && <CampaignView />}
          {activeKey==='best' && <BestContentView days={days} />}
          {activeKey==='calendar' && <ContentCalendarView />}
          {activeKey==='compare' && <ComparePeriodView days={days} />}
          {activeKey==='recommend' && <RecommendationsView days={days} />}
          {activeKey==='reports' && <ReportsView days={days} />}
          {activeKey==='settings' && <SettingsView />}

          <footer className="pt-6 pb-2 text-center text-xs text-slate-400 print:hidden">© {new Date().getFullYear()} SocialPulse</footer>
        </div>

        <PrintFooter user={user} />
      </main>
    </div>
  )
}

function PrintKop() {
  return (
    <div className="hidden print:block border-b-2 border-double border-[#0B2545] pb-3 mb-4 px-6 pt-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#1D4ED8] flex items-center justify-center print:bg-[#0B2545]"><ShieldCheck className="w-10 h-10 text-white" /></div>
        <div className="text-center flex-1">
          <div className="text-[10px] uppercase tracking-widest text-slate-600">Republik Indonesia</div>
          <div className="text-sm font-bold text-slate-900 uppercase leading-tight">Kementerian Pendidikan Dasar dan Menengah</div>
          <div className="text-lg font-black text-[#0B2545] uppercase tracking-wide leading-tight">Direktorat Kursus dan Pelatihan</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Jl. Jenderal Sudirman, Senayan · Jakarta Pusat · kursus.kemendikdasmen.go.id</div>
        </div>
        <div className="w-16 h-16 flex items-center justify-center opacity-60"><ShieldCheck className="w-10 h-10 text-[#0B2545]" /></div>
      </div>
    </div>
  )
}

function PrintFooter({ user }) {
  return (
    <div className="hidden print:block fixed bottom-4 left-0 right-0 px-6 text-[9px] text-slate-500 border-t border-slate-300 pt-2">
      <div className="flex justify-between items-center">
        <div>Dashboard Media Sosial · Direktorat Kursus dan Pelatihan</div>
        <div>Dicetak: {new Date().toLocaleString('id-ID',{ dateStyle:'long', timeStyle:'short' })} · Oleh: {user?.name} ({user?.role})</div>
      </div>
    </div>
  )
}
