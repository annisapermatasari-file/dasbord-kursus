import Link from 'next/link'
import { Instagram, Facebook, Youtube, Music2, Globe, Sparkles, FileText, Users, BarChart3 } from 'lucide-react'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import PricingCards from './PricingCards'
import { PulseMark } from './Logo'
import { PRICING_PLANS } from '@/lib/constants/pricing'

const T = {
  en: {
    title: 'Know what works on your social media, every week.',
    subtitle: 'SocialPulse pulls Instagram, Facebook, YouTube, TikTok, and your website into one dashboard, explains the numbers in plain language, and turns them into a report your boss can read.',
    ctaPrimary: 'Create an account',
    ctaSecondary: 'See pricing',
    connectsWith: 'Connects with',
    preview: {
      crumb: 'Overview',
      sentence: 'In the last 30 days, your content reached 2.1M people.',
      sub: 'Engagement is up 3.8% on the previous period. TikTok drove 33% of all interactions.',
      share: 'Where engagement came from',
      kpis: [['Followers', '149.6K', '+3.3%'], ['Engagement', '126.6K', '+3.8%'], ['Eng. rate', '6.13%', '+0.8%']],
    },
    stepsTitle: 'From login to report in three steps',
    steps: [
      { t: 'Connect your accounts', d: 'Sign in once with Meta, Google, and TikTok. No passwords are stored, and you can disconnect any time.' },
      { t: 'Read the summary', d: 'One sentence tells you how the period went. Charts and channel rankings show why.' },
      { t: 'Send the report', d: 'Pick monthly, quarterly, or executive, then print it or save it as a PDF.' },
    ],
    featuresTitle: 'Built for people who report on social media',
    features: [
      { icon: BarChart3, t: 'Every channel side by side', d: 'Reach, engagement, followers, and views for each platform, compared on the same scale.' },
      { icon: Sparkles, t: 'Insights in plain language', d: 'AI reads the period and lists findings, risks, and next steps, so you know what to say in the meeting.' },
      { icon: FileText, t: 'Reports ready to share', d: 'A cover page, KPIs, top content, and recommendations, laid out for printing.' },
      { icon: Users, t: 'Access for your whole team', d: 'Admins, analysts, executives, and viewers each see what they need.' },
    ],
    reportCover: { kicker: 'SocialPulse report', title: 'Monthly report', range: '5 Sep – 4 Oct 2026', kpis: [['Reach', '2.1M'], ['Engagement', '126.6K']] },
    pricingTitle: 'Simple pricing',
    pricingSubtitle: 'Promo prices apply for your first two months.',
    finalTitle: 'See your first summary today.',
    finalSubtitle: 'Create an account, connect one platform, and the dashboard fills in on its own.',
    finalCta: 'Create an account',
  },
  id: {
    title: 'Tahu apa yang berhasil di media sosial Anda, setiap minggu.',
    subtitle: 'SocialPulse menyatukan Instagram, Facebook, YouTube, TikTok, dan website dalam satu dashboard, menjelaskan angkanya dengan bahasa sederhana, lalu mengubahnya jadi laporan yang siap dibaca pimpinan.',
    ctaPrimary: 'Buat akun',
    ctaSecondary: 'Lihat harga',
    connectsWith: 'Terhubung dengan',
    preview: {
      crumb: 'Overview',
      sentence: 'Dalam 30 hari terakhir, konten Anda menjangkau 2,1 Jt orang.',
      sub: 'Engagement naik 3,8% dibanding periode sebelumnya. TikTok menyumbang 33% dari seluruh interaksi.',
      share: 'Asal engagement per kanal',
      kpis: [['Followers', '149,6 Rb', '+3,3%'], ['Engagement', '126,6 Rb', '+3,8%'], ['Eng. rate', '6,13%', '+0,8%']],
    },
    stepsTitle: 'Dari login sampai laporan dalam tiga langkah',
    steps: [
      { t: 'Hubungkan akun', d: 'Login sekali lewat Meta, Google, dan TikTok. Kata sandi akun media sosial tidak disimpan, dan koneksi bisa diputus kapan saja.' },
      { t: 'Baca ringkasannya', d: 'Satu kalimat merangkum performa periode ini. Grafik dan peringkat kanal menjelaskan alasannya.' },
      { t: 'Kirim laporannya', d: 'Pilih laporan bulanan, kuartalan, atau eksekutif, lalu cetak atau simpan sebagai PDF.' },
    ],
    featuresTitle: 'Dibuat untuk yang rutin melaporkan media sosial',
    features: [
      { icon: BarChart3, t: 'Semua kanal berdampingan', d: 'Jangkauan, engagement, followers, dan penayangan tiap platform dibandingkan dengan skala yang sama.' },
      { icon: Sparkles, t: 'Insight dengan bahasa sederhana', d: 'AI membaca data periode ini dan menuliskan temuan, risiko, dan langkah berikutnya, siap dibawa ke rapat.' },
      { icon: FileText, t: 'Laporan siap dibagikan', d: 'Sampul, KPI, konten terbaik, dan rekomendasi, tertata rapi untuk dicetak.' },
      { icon: Users, t: 'Akses untuk seluruh tim', d: 'Admin, analis, pimpinan, dan viewer masing-masing melihat yang mereka butuhkan.' },
    ],
    reportCover: { kicker: 'Laporan SocialPulse', title: 'Laporan bulanan', range: '5 Sep – 4 Okt 2026', kpis: [['Jangkauan', '2,1 Jt'], ['Engagement', '126,6 Rb']] },
    pricingTitle: 'Harga yang sederhana',
    pricingSubtitle: 'Harga promo berlaku untuk dua bulan pertama.',
    finalTitle: 'Lihat ringkasan pertama Anda hari ini.',
    finalSubtitle: 'Buat akun, hubungkan satu platform, dan dashboard akan terisi sendiri.',
    finalCta: 'Buat akun',
  },
}

const CHANNELS = [
  { name: 'Instagram', icon: Instagram, color: '#E1306C' },
  { name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { name: 'YouTube', icon: Youtube, color: '#FF0000' },
  { name: 'TikTok', icon: Music2, color: '#0F1B3D' },
  { name: 'Google Analytics 4', icon: Globe, color: '#0EA5E9' },
]
const SHARE = [['#0F1B3D', 33], ['#E1306C', 27], ['#1877F2', 17], ['#FF0000', 13], ['#0EA5E9', 10]]

/** Cuplikan dashboard asli (bukan gambar) — menunjukkan apa yang didapat pengguna. */
function ProductPreview({ p }) {
  return (
    <div className="rounded-2xl bg-ink p-2.5 shadow-[0_30px_60px_-20px_rgba(15,27,61,0.45)]" aria-hidden="true">
      <div className="flex gap-2.5">
        <div className="hidden w-[118px] shrink-0 flex-col gap-1.5 px-2 py-3 sm:flex">
          <div className="mb-3 flex items-center gap-1.5 text-white"><span className="flex h-5 w-5 items-center justify-center rounded bg-signal"><PulseMark className="h-3 w-3" /></span><span className="text-[11px] font-extrabold">SocialPulse</span></div>
          <div className="rounded-md bg-white px-2 py-1.5 text-[10px] font-semibold text-ink">{p.crumb}</div>
          {['Instagram', 'Facebook', 'YouTube', 'TikTok', 'Website'].map(x => <div key={x} className="px-2 py-1 text-[10px] text-white/55">{x}</div>)}
        </div>
        <div className="min-w-0 flex-1 rounded-xl bg-paper p-4 sm:p-5">
          <div className="rounded-xl border border-ink/[0.08] bg-white p-4 sm:p-5">
            <p className="text-[17px] font-extrabold leading-tight tracking-tight text-ink sm:text-[20px]">{p.sentence}</p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">{p.sub}</p>
            <div className="mt-4 text-[10px] text-ink-muted">{p.share}</div>
            <div className="mt-1.5 flex h-2 overflow-hidden rounded-full">
              {SHARE.map(([c, w]) => <div key={c} style={{ width: `${w}%`, background: c }} />)}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {p.kpis.map(([l, v, ch]) => (
              <div key={l} className="rounded-lg border border-ink/[0.08] bg-white p-2.5">
                <div className="text-[9.5px] text-ink-muted">{l}</div>
                <div className="mt-0.5 text-[14px] font-extrabold text-ink tabular">{v}</div>
                <div className="text-[9.5px] font-semibold text-growth tabular">{ch}</div>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 300 60" className="mt-3 h-12 w-full" preserveAspectRatio="none">
            <path d="M0 42 C20 38 30 30 50 34 S80 22 100 28 S130 40 150 26 S180 10 200 20 S240 30 260 16 S290 12 300 14" fill="none" stroke="#2350E6" strokeWidth="2" />
            <path d="M0 50 C25 48 35 44 55 46 S85 38 105 42 S135 48 155 40 S185 30 205 36 S245 42 265 32 S290 30 300 31" fill="none" stroke="#0E9F8E" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function ReportCover({ r }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink p-8 text-white sm:p-10" aria-hidden="true">
      <svg className="absolute -right-6 bottom-0 w-[70%] opacity-[0.10]" viewBox="0 0 400 120" fill="none">
        <path d="M0 90h70l20-48 32 88 20-40h50l18-60 30 70 20-30h140" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <div className="relative">
        <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">{r.kicker}</span>
        <div className="mt-5 text-[32px] font-extrabold leading-none tracking-tight">{r.title}</div>
        <div className="mt-3 text-[13px] text-white/60">{r.range}</div>
        <div className="mt-8 grid grid-cols-2 gap-5 border-t border-white/15 pt-5">
          {r.kpis.map(([l, v]) => (
            <div key={l}><div className="text-[11px] text-white/55">{l}</div><div className="text-[22px] font-extrabold tabular">{v}</div></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingScreen({ searchParams }) {
  const language = searchParams?.lang === 'id' ? 'id' : 'en'
  const t = T[language]
  const plans = PRICING_PLANS[language]

  return (
    <main className="min-h-screen bg-paper text-ink">
      <SiteHeader lang={language} basePath="/" variant="full" />

      {/* HERO — tulisan di kiri, cuplikan dashboard asli di kanan */}
      <section className="px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h1 className="max-w-[16ch] text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-[52px] lg:text-[58px]">{t.title}</h1>
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-ink-muted">{t.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/register?lang=${language}`} className="rounded-full bg-signal px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-signal-deep">{t.ctaPrimary}</Link>
              <Link href="#pricing" className="rounded-full border border-ink/15 bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-ink/30">{t.ctaSecondary}</Link>
            </div>
          </div>
          <ProductPreview p={t.preview} />
        </div>
      </section>

      {/* PLATFORM */}
      <section className="border-y border-ink/[0.07] bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3">
          <span className="text-[14px] text-ink-muted">{t.connectsWith}</span>
          {CHANNELS.map(({ name, icon: Icon, color }) => (
            <span key={name} className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink-soft">
              <Icon className="h-[18px] w-[18px]" style={{ color }} aria-hidden="true" />{name}
            </span>
          ))}
        </div>
      </section>

      {/* LANGKAH — urutan nyata, jadi bernomor */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-[22ch] text-[30px] font-extrabold leading-tight tracking-tight sm:text-[36px]">{t.stepsTitle}</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {t.steps.map((s, i) => (
              <li key={s.t} className="border-t-2 border-ink pt-5">
                <div className="text-[15px] font-extrabold text-signal tabular">{i + 1}</div>
                <h3 className="mt-2 text-[19px] font-bold">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FITUR */}
      <section className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="max-w-[20ch] text-[30px] font-extrabold leading-tight tracking-tight sm:text-[36px]">{t.featuresTitle}</h2>
            <ul className="mt-8 space-y-6">
              {t.features.map(({ icon: Icon, t: title, d }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div>
                    <h3 className="text-[17px] font-bold">{title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ReportCover r={t.reportCover} />
        </div>
      </section>

      {/* HARGA */}
      <section id="pricing" className="scroll-mt-16 px-4 py-20 sm:px-6">
        <div className="mx-auto mb-12 max-w-6xl">
          <h2 className="text-[30px] font-extrabold tracking-tight sm:text-[36px]">{t.pricingTitle}</h2>
          <p className="mt-3 max-w-[60ch] text-[16px] text-ink-muted">{t.pricingSubtitle}</p>
        </div>
        <PricingCards plans={plans} language={language} />
      </section>

      {/* CTA AKHIR */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-2xl bg-signal px-8 py-12 text-white sm:px-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">{t.finalTitle}</h2>
            <p className="mt-2 max-w-[52ch] text-[16px] text-white/80">{t.finalSubtitle}</p>
          </div>
          <Link href={`/register?lang=${language}`} className="shrink-0 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-ink hover:bg-white/90">{t.finalCta}</Link>
        </div>
      </section>

      <SiteFooter lang={language} />
    </main>
  )
}
