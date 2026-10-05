'use client'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, BarChart3, Instagram, Facebook, Youtube, Music2, Globe,
  FileText, Users, Heart, MessageSquareText, Megaphone, Trophy, Lightbulb,
  FileBarChart, Settings, ChevronLeft, ChevronRight, RefreshCw, ShieldCheck,
  LogOut, Crown, Calendar as CalendarIcon, GitCompareArrows, Menu, X,
} from 'lucide-react'
import { PeriodFilter, PERIODS, MockDataBanner, apiFetch } from '@/components/dash/shared'
import {
  OverviewView, SocialMediaView, PlatformDetailView, WebsiteView,
  ContentView, AudienceView, EngagementView, SentimentView, CampaignView,
  BestContentView, RecommendationsView, ReportsView, SettingsView,
  ExecutiveSummaryView, ContentCalendarView, ComparePeriodView,
} from '@/components/dash/views'
import LandingScreen from '@/components/marketing/LandingScreen'

const MENU = [
  { key:'overview', group:'Ringkasan', label:'Overview', icon: LayoutDashboard, title:'Overview', desc:'Gambaran performa semua kanal dalam satu halaman.' },
  { key:'executive', group:'Ringkasan', label:'Executive Summary', icon: Crown, title:'Executive Summary', desc:'Ringkasan singkat untuk pimpinan.', highlight:true },
  { key:'compare', group:'Ringkasan', label:'Bandingkan periode', icon: GitCompareArrows, title:'Bandingkan periode', desc:'Periode ini dibandingkan dengan periode sebelumnya.' },
  { key:'social', group:'Kanal', label:'Semua platform', icon: BarChart3, title:'Performa semua platform', desc:'Perbandingan performa antar platform.' },
  { key:'instagram', group:'Kanal', label:'Instagram', icon: Instagram, title:'Instagram', desc:'Performa akun Instagram Anda.' },
  { key:'facebook', group:'Kanal', label:'Facebook', icon: Facebook, title:'Facebook', desc:'Performa Halaman Facebook Anda.' },
  { key:'youtube', group:'Kanal', label:'YouTube', icon: Youtube, title:'YouTube', desc:'Performa channel YouTube Anda.' },
  { key:'tiktok', group:'Kanal', label:'TikTok', icon: Music2, title:'TikTok', desc:'Performa akun TikTok Anda.' },
  { key:'website', group:'Kanal', label:'Website', icon: Globe, title:'Website', desc:'Traffic dan engagement website dari Google Analytics 4.' },
  { key:'content', group:'Analisis', label:'Konten', icon: FileText, title:'Analisis konten', desc:'Semua konten beserta Performance Score.' },
  { key:'best', group:'Analisis', label:'Konten terbaik', icon: Trophy, title:'Konten terbaik', desc:'Peringkat konten terbaik lintas platform.' },
  { key:'audience', group:'Analisis', label:'Audiens', icon: Users, title:'Audiens', desc:'Demografi dan perilaku audiens.' },
  { key:'engagement', group:'Analisis', label:'Engagement', icon: Heart, title:'Engagement', desc:'Bagaimana audiens berinteraksi dengan konten.' },
  { key:'sentiment', group:'Analisis', label:'Sentimen', icon: MessageSquareText, title:'Sentimen publik', desc:'Persepsi publik dari komentar.' },
  { key:'campaign', group:'Analisis', label:'Kampanye', icon: Megaphone, title:'Kampanye', desc:'Performa kampanye komunikasi.' },
  { key:'calendar', group:'Perencanaan', label:'Kalender konten', icon: CalendarIcon, title:'Kalender konten', desc:'Rencanakan dan jadwalkan konten yang akan tayang.' },
  { key:'recommend', group:'Perencanaan', label:'Rekomendasi', icon: Lightbulb, title:'Rekomendasi', desc:'Saran tindakan berbasis data.' },
  { key:'reports', group:'Laporan', label:'Buat laporan', icon: FileBarChart, title:'Buat laporan', desc:'Laporan bulanan, kuartalan, tahunan, atau eksekutif.' },
  { key:'settings', group:'Admin', label:'Pengaturan', icon: Settings, title:'Pengaturan', desc:'Koneksi media sosial, pengguna, dan organisasi.' },
]
const GROUPS = ['Ringkasan','Kanal','Analisis','Perencanaan','Laporan','Admin']

const ROLES = {
  Admin:    { color:'#E5484D', desc:'Akses penuh — kelola pengguna, API, dan semua data', allow:'*' },
  Analyst:  { color:'#2350E6', desc:'Melihat semua data & generate laporan', allow: MENU.filter(m => m.key !== 'settings').map(m => m.key) },
  Executive:{ color:'#F0A92B', desc:'Ringkasan eksekutif & laporan untuk pimpinan', allow: ['overview','executive','best','recommend','sentiment','reports'] },
  Viewer:   { color:'#5B6785', desc:'Melihat dashboard performa dasar saja', allow: ['overview','social','instagram','facebook','youtube','tiktok','website'] },
}

// Fitur yang tersedia per paket berlangganan — dikombinasikan dengan hak akses role.
const PLANS = {
  starter:  { label:'Starter',  allow: ['overview','social','instagram','facebook','youtube','tiktok','website','content','settings'] },
  business: { label:'Business', allow: ['overview','social','instagram','facebook','youtube','tiktok','website','content','settings','audience','engagement','sentiment','campaign','best','calendar','compare','recommend','reports','executive'] },
  agency:   { label:'Agency',   allow: '*' },
}

function hasAccess(role, plan, key) {
  const r = ROLES[role]; if (!r) return false
  const roleOk = r.allow === '*' || r.allow.includes(key)
  const p = PLANS[plan] || PLANS.starter
  const planOk = p.allow === '*' || p.allow.includes(key)
  return roleOk && planOk
}

function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 13h3.5l2.5-6 4 11 2.5-5H21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function App({ searchParams }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [active, setActive] = useState('overview')
  const [period, setPeriod] = useState('30')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [user, setUser] = useState(null)
  const [liveCount, setLiveCount] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setLastUpdated(new Date())
    let saved = null
    try { saved = JSON.parse(localStorage.getItem('dashboard_user') || 'null') } catch {}
    if (!saved) return
    setUser(saved)
    // Pastikan sesi server (cookie HttpOnly) masih berlaku; data di localStorage hanya untuk tampilan
    fetch('/api/auth/me').then(async r => {
      if (r.status === 401) { try { localStorage.removeItem('dashboard_user') } catch {}; setUser(null); return }
      const j = await r.json().catch(() => null)
      if (j?.user) { setUser(j.user); try { localStorage.setItem('dashboard_user', JSON.stringify(j.user)) } catch {} }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    apiFetch('/api/connections').then(r => r.json()).then(j => {
      const c = j.connections || []
      const meta = c.find(x => x.provider === 'meta'), google = c.find(x => x.provider === 'google'), tt = c.find(x => x.provider === 'tiktok')
      setLiveCount([meta?.ig_accounts?.length, meta?.pages?.length, google?.channels?.length, tt, google?.ga_properties?.length].filter(Boolean).length)
    }).catch(() => setLiveCount(0))
  }, [user, refreshKey])

  async function logout() {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }) } catch {}
    setUser(null); try { localStorage.removeItem('dashboard_user') } catch {}; setActive('overview')
  }

  if (!user) return <LandingScreen searchParams={searchParams} />

  const days = (PERIODS.find(p => p.key === period) || PERIODS[2]).days
  const visibleMenu = MENU.filter(m => hasAccess(user.role, user.plan, m.key))
  const current = visibleMenu.find(m => m.key === active) || visibleMenu[0]
  const activeKey = current?.key || 'overview'
  const go = (key) => { setActive(key); setMobileNav(false); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }) }

  function handleRefresh() { setRefreshing(true); setRefreshKey(k => k + 1); setTimeout(() => { setLastUpdated(new Date()); setRefreshing(false) }, 900) }

  const isMock = liveCount === 0
  const showPeriod = !['settings','calendar'].includes(activeKey)

  const nav = (compact) => (
    <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Menu utama">
      {GROUPS.map(g => {
        const items = visibleMenu.filter(m => m.group === g)
        if (!items.length) return null
        return (
          <div key={g} className="mt-5 first:mt-2">
            {!compact && <div className="px-3 mb-1.5 text-[12px] font-medium text-white/40">{g}</div>}
            {compact && <div className="mx-3 mb-2 border-t border-white/10" />}
            <div className="space-y-0.5">
              {items.map(m => { const Icon = m.icon; const isActive = activeKey === m.key; return (
                <button key={m.key} onClick={() => go(m.key)} title={compact ? m.label : undefined} aria-current={isActive ? 'page' : undefined}
                  className={`relative w-full flex items-center gap-3 rounded-lg text-[13.5px] transition-colors ${compact ? 'justify-center py-2.5' : 'px-3 py-2'}
                    ${isActive ? 'bg-white text-ink font-semibold' : 'text-white/70 hover:text-white hover:bg-white/[0.06]'}`}>
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${m.highlight && !isActive ? 'text-marigold' : ''}`} />
                  {!compact && <span className="truncate text-left flex-1">{m.label}</span>}
                  {!compact && m.highlight && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-marigold-soft text-marigold-deep' : 'bg-marigold/15 text-marigold'}`}>Pimpinan</span>}
                </button>
              )})}
            </div>
          </div>
        )
      })}
    </nav>
  )

  const userCard = (
    <div className="p-3 border-t border-white/10">
      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.06]">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: ROLES[user.role]?.color }}>{user.initial}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold truncate">{user.name}</div>
          <div className="text-[11px] text-white/50 truncate">{user.role}{user.plan ? ` · Paket ${PLANS[user.plan]?.label || user.plan}` : ''}</div>
        </div>
        <button onClick={logout} title="Keluar" aria-label="Keluar" className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/60"><LogOut className="w-4 h-4" /></button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-paper print:bg-white">
      {/* Sidebar desktop */}
      <aside className={`${collapsed ? 'w-[76px]' : 'w-[260px]'} hidden lg:flex transition-[width] duration-300 shrink-0 bg-ink text-white flex-col sticky top-0 h-screen print:hidden`}>
        <div className={`h-16 flex items-center gap-2.5 ${collapsed ? 'justify-center' : 'px-6'}`}>
          <div className="w-8 h-8 rounded-lg bg-signal flex items-center justify-center shrink-0"><Logo className="w-5 h-5 text-white" /></div>
          {!collapsed && <span className="text-[17px] font-extrabold tracking-tight">SocialPulse</span>}
        </div>
        {nav(collapsed)}
        {!collapsed && userCard}
        <div className="p-3 border-t border-white/10">
          <button onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? 'Lebarkan menu' : 'Ciutkan menu'} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white/60 hover:bg-white/[0.06] hover:text-white text-xs">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Ciutkan menu</>}
          </button>
        </div>
      </aside>

      {/* Sidebar mobile (drawer) */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileNav(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-ink text-white flex flex-col">
            <div className="h-16 flex items-center justify-between px-5">
              <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-signal flex items-center justify-center"><Logo className="w-5 h-5 text-white" /></div><span className="text-[17px] font-extrabold tracking-tight">SocialPulse</span></div>
              <button onClick={() => setMobileNav(false)} aria-label="Tutup menu" className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            {nav(false)}
            {userCard}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <PrintKop />

        <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-ink/[0.07] print:hidden">
          <div className="px-4 sm:px-6 lg:px-10 h-16 flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} aria-label="Buka menu" className="lg:hidden w-10 h-10 -ml-2 rounded-lg hover:bg-ink/5 flex items-center justify-center"><Menu className="w-5 h-5" /></button>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-ink-muted truncate">{current.group}</div>
              <h1 className="text-[17px] font-bold text-ink leading-tight truncate">{current.title}</h1>
            </div>
            <button onClick={() => go('settings')} className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium ${isMock ? 'bg-marigold-soft text-marigold-deep' : 'bg-growth-soft text-growth'}`} title="Status koneksi media sosial">
              <span className={`w-1.5 h-1.5 rounded-full ${isMock ? 'bg-marigold' : 'bg-growth'}`} />
              {liveCount === null ? 'Memeriksa koneksi…' : isMock ? 'Data contoh' : `${liveCount} kanal live`}
            </button>
            <button onClick={handleRefresh} aria-label="Muat ulang data" title={lastUpdated ? `Terakhir diperbarui ${lastUpdated.toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })}` : 'Muat ulang data'} className="w-10 h-10 rounded-lg border border-ink/10 bg-white hover:bg-ink/[0.03] flex items-center justify-center text-ink-soft">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-6 print:p-0 max-w-[1480px]">
          <div className="flex items-end justify-between flex-wrap gap-4 print:hidden">
            <p className="text-[14px] text-ink-muted max-w-[60ch]">{current.desc}</p>
            {showPeriod && <PeriodFilter value={period} onChange={setPeriod} />}
          </div>

          {isMock && !['settings','executive','calendar'].includes(activeKey) && (
            <div className="print:hidden"><MockDataBanner onConnect={user.role === 'Admin' ? () => go('settings') : undefined} /></div>
          )}

          <div key={`${activeKey}-${refreshKey}`}>
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
            {activeKey==='settings' && <SettingsView plan={user.plan} />}
          </div>

          <footer className="pt-8 pb-2 text-xs text-ink-muted/70 print:hidden">© {new Date().getFullYear()} SocialPulse</footer>
        </div>

        <PrintFooter user={user} />
      </main>
    </div>
  )
}

function PrintKop() {
  return (
    <div className="hidden print:block border-b-2 border-ink pb-3 mb-4 px-6 pt-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center"><Logo className="w-6 h-6 text-white" /></div>
        <div>
          <div className="text-lg font-extrabold text-ink leading-tight">SocialPulse</div>
          <div className="text-[10px] text-ink-muted">Monitoring, analisis, dan evaluasi komunikasi digital</div>
        </div>
      </div>
    </div>
  )
}

function PrintFooter({ user }) {
  return (
    <div className="hidden print:block fixed bottom-4 left-0 right-0 px-6 text-[9px] text-ink-muted border-t border-slate-300 pt-2">
      <div className="flex justify-between items-center">
        <div>SocialPulse</div>
        <div>Dicetak {new Date().toLocaleString('id-ID',{ dateStyle:'long', timeStyle:'short' })} oleh {user?.name} ({user?.role})</div>
      </div>
    </div>
  )
}
