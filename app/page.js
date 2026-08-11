'use client'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, BarChart3, Instagram, Facebook, Youtube, Music2, Globe,
  FileText, Users, Heart, MessageSquareText, Megaphone, Trophy, Lightbulb,
  FileBarChart, Settings, ChevronLeft, ChevronRight, RefreshCw, ShieldCheck,
  LogOut, User, Building2, Crown, Eye, EyeOff, Info, Calendar as CalendarIcon, GitCompareArrows,
} from 'lucide-react'
import { PeriodFilter, PERIODS, MockDataBanner } from '@/components/dash/shared'
import {
  OverviewView, SocialMediaView, PlatformDetailView, WebsiteView,
  ContentView, AudienceView, EngagementView, SentimentView, CampaignView,
  BestContentView, RecommendationsView, ReportsView, SettingsView,
  ExecutiveSummaryView, ContentCalendarView, ComparePeriodView,
} from '@/components/dash/views'

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

const PRESET_USERS = [
  { name:'Annisa Permatasari', role:'Admin',     initial:'AP', jabatan:'Kepala Sub-Bagian Humas',            email:'annisa.permatasari@dikdasmen.belajar.id', password:'Admin@2026' },
  { name:'Rina Setiawati',     role:'Analyst',   initial:'RS', jabatan:'Analis Komunikasi Digital',          email:'rina.setiawati@dikdasmen.belajar.id',     password:'Analyst@2026' },
  { name:'Budi Santosa',       role:'Executive', initial:'BS', jabatan:'Direktur Kursus dan Pelatihan',      email:'budi.santosa@dikdasmen.belajar.id',       password:'Executive@2026' },
  { name:'Dewi Rahayu',        role:'Viewer',    initial:'DR', jabatan:'Staf Publikasi',                     email:'dewi.rahayu@dikdasmen.belajar.id',        password:'Viewer@2026' },
]

function hasAccess(role, key) {
  const r = ROLES[role]; if (!r) return false
  return r.allow === '*' || r.allow.includes(key)
}

export default function App() {
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

  function loginAs(u) { setUser(u); try { localStorage.setItem('dashboard_user', JSON.stringify(u)) } catch {}; setActive(u.role === 'Executive' ? 'executive' : 'overview') }
  function logout() { setUser(null); try { localStorage.removeItem('dashboard_user') } catch {}; setActive('overview') }

  if (!user) return <AuthScreen onLogin={loginAs} />

  const days = (PERIODS.find(p => p.key === period) || PERIODS[2]).days
  const visibleMenu = MENU.filter(m => hasAccess(user.role, m.key))
  const current = visibleMenu.find(m => m.key === active) || visibleMenu[0]
  const activeKey = current?.key || 'overview'

  function handleRefresh() { setRefreshing(true); setTimeout(() => { setLastUpdated(new Date()); setRefreshing(false) }, 900) }

  return (
    <div className="min-h-screen flex bg-slate-50 print:bg-white">
      <aside className={`${collapsed ? 'w-[76px]' : 'w-[268px]'} transition-all duration-300 shrink-0 bg-[#0B2545] text-slate-100 flex flex-col sticky top-0 h-screen print:hidden`}>
        <div className="px-4 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 ring-1 ring-white/15"><ShieldCheck className="w-6 h-6 text-white" /></div>
          {!collapsed && <div className="min-w-0"><div className="text-[11px] uppercase tracking-wider text-blue-200/80">Direktorat</div><div className="text-sm font-semibold leading-tight truncate">Kursus &amp; Pelatihan</div></div>}
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {visibleMenu.map(m => { const Icon = m.icon; const isActive = activeKey === m.key; return (
            <button key={m.key} onClick={() => setActive(m.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${isActive ? 'bg-blue-500/95 text-white shadow-lg shadow-blue-900/30' : 'text-slate-200/85 hover:bg-white/5'}
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
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#1D4ED8] flex items-center justify-center ring-1 ring-slate-200 shadow-sm"><ShieldCheck className="w-7 h-7 text-white" /></div>
              <div>
                <h1 className="text-[22px] leading-tight font-bold text-slate-900 tracking-tight">Dashboard Media Sosial Direktorat Kursus dan Pelatihan</h1>
                <p className="text-sm text-slate-500 mt-1">Monitoring, Analisis, dan Evaluasi Komunikasi Digital &middot; <span className="italic">Data-driven Communication for Education</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: ROLES[user.role]?.color }}>
                <User className="w-3.5 h-3.5" />{user.role}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Connected · Mock Data</div>
              <div className="text-xs text-slate-500 hidden md:block"><div>Terakhir diperbarui</div><div className="font-medium text-slate-700">{lastUpdated ? lastUpdated.toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' }) : '—'}</div></div>
              <button onClick={handleRefresh} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0B2545] text-white text-sm hover:bg-[#0e2f5c]"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh Data</button>
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

          <footer className="pt-6 pb-2 text-center text-xs text-slate-400 print:hidden">© {new Date().getFullYear()} Direktorat Kursus dan Pelatihan — Kementerian Pendidikan Dasar dan Menengah</footer>
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

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'forgot'
  return mode === 'forgot'
    ? <ForgotPasswordScreen onBack={()=>setMode('login')} />
    : <LoginScreen onLogin={onLogin} onForgot={()=>setMode('forgot')} />
}

function LoginScreen({ onLogin, onForgot }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [showHint, setShowHint] = useState(false)

  async function submit(e) {
    e?.preventDefault?.()
    setError('')
    const em = email.trim().toLowerCase()
    try {
      const r = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: em, password }) })
      const j = await r.json()
      if (r.ok && j.user) { onLogin(j.user); return }
      setError(j.error || 'Email atau kata sandi salah. Coba lagi.')
    } catch (err) { setError('Gagal menghubungi server. Coba lagi.') }
  }
  function fillAs(u) { setEmail(u.email); setPassword(u.password); setError('') }

  return (
    <div className="min-h-screen bg-slate-50 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* LEFT — Hero photo + branding overlay */}
      <div className="relative min-h-[420px] lg:min-h-screen overflow-hidden text-white">
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1690356107685-3725367f6f3f?w=1600&q=80&auto=format&fit=crop')" }} />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545]/95 via-[#0B2545]/85 to-[#1D4ED8]/75" />
        {/* Content */}
        <div className="relative z-10 p-8 lg:p-14 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20"><ShieldCheck className="w-7 h-7 text-white" /></div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-blue-200 font-semibold">Kemendikdasmen</div>
                <div className="text-sm font-bold text-white leading-tight">Direktorat Kursus &amp; Pelatihan</div>
              </div>
            </div>

            <div className="mt-14 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-blue-100 text-[11px] font-semibold uppercase tracking-wider mb-5 ring-1 ring-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Direktorat Kursus dan Pelatihan
              </div>
              <h1 className="text-4xl md:text-[52px] font-black tracking-tight leading-[1.05]">
                Terampil,<br />Bersertifikasi,<br />
                <span className="text-blue-200">Berdaya Saing Global.</span>
              </h1>
              <p className="text-blue-100/90 mt-5 leading-relaxed max-w-md">
                Kami mengembangkan kompetensi masyarakat Indonesia melalui program <strong className="text-white">kursus</strong>, <strong className="text-white">pelatihan</strong>, dan <strong className="text-white">sertifikasi</strong> berbasis kebutuhan industri — melalui LKP di seluruh nusantara.
              </p>
            </div>
          </div>

          {/* Impact stats */}
          <div className="mt-10">
            <div className="text-[10px] uppercase tracking-[0.2em] text-blue-200/80 font-bold mb-3">Dampak Direktorat</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { v:'1,2 Jt+', l:'Alumni Bersertifikasi', s:'BNSP-terverifikasi' },
                { v:'12.000+', l:'LKP Aktif', s:'Tersebar 34 provinsi' },
                { v:'86%',    l:'Penempatan Kerja', s:'Alumni bekerja/berwirausaha' },
                { v:'450+',   l:'Bidang Keahlian', s:'Selaras SKKNI & industri' },
              ].map(s => (
                <div key={s.l} className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-3">
                  <div className="text-2xl font-black tracking-tight text-white">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold mt-1">{s.l}</div>
                  <div className="text-[10px] text-blue-100/70 mt-0.5">{s.s}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-blue-200/60 mt-4">© {new Date().getFullYear()} Kementerian Pendidikan Dasar dan Menengah · Portal internal — pemantauan komunikasi digital</div>
          </div>
        </div>
      </div>

      {/* RIGHT — Login form */}
      <div className="p-8 lg:p-16 flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">Masuk ke Dashboard</h2>
          <p className="text-slate-500 mt-1 text-sm">Gunakan akun institusi Anda untuk melanjutkan.</p>

          <form onSubmit={submit} className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@dikdasmen.belajar.id"
                     autoComplete="username" className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Kata Sandi</label>
              <div className="relative mt-1">
                <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                       autoComplete="current-password" className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <div className="text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>}

            <button type="submit" className="w-full py-3 rounded-lg bg-[#0B2545] text-white font-semibold hover:bg-[#0e2f5c] transition shadow-sm">Masuk</button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button type="button" onClick={onForgot} className="text-blue-600 hover:text-blue-800 font-medium">Lupa kata sandi?</button>
              <a href="#" className="text-slate-400 hover:text-slate-600">Butuh bantuan?</a>
            </div>

            <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-500 leading-relaxed">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Otorisasi akun media sosial dilakukan setelah masuk. Kata sandi media sosial tidak pernah diminta atau disimpan di sistem ini.</span>
            </div>
          </form>

          {/* Demo accounts helper */}
          <div className="mt-4">
            <button onClick={()=>setShowHint(v=>!v)} className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1">
              {showHint ? <><EyeOff className="w-3 h-3" /> Sembunyikan akun demo</> : <><Eye className="w-3 h-3" /> Lihat akun demo untuk uji coba</>}
            </button>
            {showHint && (
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <div className="text-[11px] text-slate-500 font-medium">Klik salah satu untuk mengisi otomatis:</div>
                {PRESET_USERS.map(u => (
                  <button key={u.email} onClick={()=>fillAs(u)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: ROLES[u.role]?.color }}>{u.initial}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5"><span className="text-xs font-semibold text-slate-900">{u.name}</span><span className="text-[9px] px-1 py-0.5 rounded font-semibold text-white" style={{ background: ROLES[u.role]?.color }}>{u.role}</span></div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{u.email} · {u.password}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-center mt-6 flex items-center justify-center gap-3">
            <a href="#" className="hover:text-slate-600">Syarat Layanan</a>·<a href="#" className="hover:text-slate-600">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ForgotPasswordScreen({ onBack }) {
  const [step, setStep] = useState(1) // 1=request, 2=verify+reset, 3=done
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPw, setNewPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devCode, setDevCode] = useState(null)
  const [masked, setMasked] = useState('')

  async function requestCode(e) {
    e?.preventDefault?.()
    setError(''); setLoading(true)
    try {
      const r = await fetch('/api/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) })
      const j = await r.json()
      if (!r.ok) { setError(j.error || 'Gagal meminta kode reset.'); setLoading(false); return }
      setDevCode(j.dev_code); setMasked(j.masked_email || email); setStep(2)
    } catch { setError('Server error') }
    setLoading(false)
  }
  async function submitReset(e) {
    e?.preventDefault?.()
    setError(''); setLoading(true)
    try {
      const r = await fetch('/api/auth/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, code, new_password: newPw }) })
      const j = await r.json()
      if (!r.ok) { setError(j.error || 'Gagal reset kata sandi.'); setLoading(false); return }
      setStep(3)
    } catch { setError('Server error') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* LEFT — Hero photo + branding overlay */}
      <div className="relative min-h-[420px] lg:min-h-screen overflow-hidden text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1690356107685-3725367f6f3f?w=1600&q=80&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545]/95 via-[#0B2545]/85 to-[#1D4ED8]/75" />
        <div className="relative z-10 p-8 lg:p-14 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20"><ShieldCheck className="w-7 h-7 text-white" /></div>
              <div><div className="text-[10px] uppercase tracking-[0.25em] text-blue-200 font-semibold">Kemendikdasmen</div><div className="text-sm font-bold text-white leading-tight">Direktorat Kursus &amp; Pelatihan</div></div>
            </div>
            <div className="mt-14 max-w-lg">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">Lupa Kata Sandi?<br /><span className="text-blue-200">Tidak masalah.</span></h1>
              <p className="text-blue-100/90 mt-5 leading-relaxed">Kami akan mengirim kode verifikasi <strong className="text-white">6 digit</strong> ke email Anda. Gunakan kode tersebut untuk mengatur kata sandi baru.</p>
              <div className="mt-6 space-y-3">
                {[
                  { n:1, t:'Masukkan email institusi Anda', d:'Sistem akan memverifikasi keberadaan akun.' },
                  { n:2, t:'Cek email untuk kode 6 digit', d:'Kode berlaku selama 15 menit sejak dibuat.' },
                  { n:3, t:'Buat kata sandi baru', d:'Minimal 6 karakter. Kombinasikan huruf, angka, & simbol.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step>=s.n?'bg-blue-400 text-white ring-2 ring-blue-300/50':'bg-white/10 text-blue-200 ring-1 ring-white/20'}`}>{s.n}</div>
                    <div><div className="text-sm font-semibold text-white">{s.t}</div><div className="text-xs text-blue-100/70 mt-0.5">{s.d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-blue-200/60">© {new Date().getFullYear()} Kementerian Pendidikan Dasar dan Menengah</div>
        </div>
      </div>

      {/* RIGHT form */}
      <div className="p-8 lg:p-16 flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 mb-4"><ChevronLeft className="w-3 h-3" /> Kembali ke halaman masuk</button>

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Reset Kata Sandi</h2>
              <p className="text-slate-500 mt-1 text-sm">Masukkan email akun institusi Anda. Kami akan kirim kode verifikasi.</p>
              <form onSubmit={requestCode} className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Email</label>
                  <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@dikdasmen.belajar.id" className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                </div>
                {error && <div className="text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>}
                <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-[#0B2545] text-white font-semibold hover:bg-[#0e2f5c] disabled:opacity-60 shadow-sm">{loading?'Mengirim…':'Kirim Kode Verifikasi'}</button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Verifikasi &amp; Kata Sandi Baru</h2>
              <p className="text-slate-500 mt-1 text-sm">Kode verifikasi dikirim ke <span className="font-mono text-slate-700">{masked}</span></p>
              {devCode !== null && (
                <div className="mt-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-4">
                  <div className="text-[10px] uppercase tracking-widest text-amber-700 font-bold">⚠ Mode Demo — Email Service Belum Diaktifkan</div>
                  <div className="text-xs text-amber-800 mt-1">Kode verifikasi Anda ditampilkan di sini karena SendGrid/SMTP belum disambungkan. Di produksi kode akan dikirim ke email.</div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 font-mono text-3xl font-black tracking-widest text-amber-900 text-center bg-white rounded-lg py-3 border border-amber-200">{devCode}</div>
                    <button type="button" onClick={()=>{ setCode(devCode); }} className="text-xs px-3 py-2 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-medium">Isi otomatis</button>
                  </div>
                </div>
              )}
              {devCode === null && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">Jika email Anda terdaftar, kode verifikasi telah dikirim. Cek folder inbox dan spam.</div>
              )}
              <form onSubmit={submitReset} className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Kode Verifikasi</label>
                  <input type="text" required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="6 digit angka" maxLength={6} inputMode="numeric" className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Kata Sandi Baru</label>
                  <div className="relative mt-1">
                    <input type={showPw?'text':'password'} required value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Minimal 6 karakter" className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                    <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                {error && <div className="text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={()=>{ setStep(1); setCode(''); setNewPw(''); setError('') }} className="text-sm px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50">Ganti Email</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 rounded-lg bg-[#0B2545] text-white font-semibold hover:bg-[#0e2f5c] disabled:opacity-60 shadow-sm">{loading?'Memproses…':'Reset Kata Sandi'}</button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><ShieldCheck className="w-9 h-9" /></div>
              <h2 className="text-xl font-bold text-slate-900 mt-4">Kata Sandi Berhasil Direset</h2>
              <p className="text-slate-500 mt-2 text-sm">Silakan masuk kembali menggunakan kata sandi baru Anda.</p>
              <button onClick={onBack} className="mt-6 inline-block px-5 py-3 rounded-lg bg-[#0B2545] text-white font-semibold hover:bg-[#0e2f5c]">Ke Halaman Masuk →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

