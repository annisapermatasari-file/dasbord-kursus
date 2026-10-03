import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'

// Plus Jakarta Sans — typeface yang dirancang untuk identitas kota Jakarta
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-jakarta', display: 'swap' })

export const metadata = {
  title: 'SocialPulse — Dashboard Media Sosial',
  description: 'Monitoring, Analisis, dan Evaluasi Komunikasi Digital — Data-driven Social Media Management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-sans antialiased bg-paper text-ink">{children}</body>
    </html>
  )
}
