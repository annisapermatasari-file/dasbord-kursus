import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Dashboard Media Sosial — Direktorat Kursus dan Pelatihan',
  description: 'Monitoring, Analisis, dan Evaluasi Komunikasi Digital — Data-driven Communication for Education',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  )
}
