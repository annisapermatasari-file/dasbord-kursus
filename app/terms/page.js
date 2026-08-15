 'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function TermsPage() {
  const [language, setLanguage] = useState('en')

  const isEnglish = language === 'en'

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              📊
            </div>

            <div>
              <div className="font-bold">SocialPulse</div>
              <div className="text-[10px] uppercase tracking-widest text-blue-400">
                Analytics Platform
              </div>
            </div>
          </Link>

          {/* LANGUAGE */}
          <div className="flex rounded-full border border-slate-700 bg-slate-900 p-1">

            <button
              onClick={() => setLanguage('en')}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                isEnglish
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400'
              }`}
            >
              🇬🇧 English
            </button>

            <button
              onClick={() => setLanguage('id')}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                !isEnglish
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400'
              }`}
            >
              🇮🇩 Indonesia
            </button>

          </div>

        </div>
      </header>

      {/* CONTENT */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">

          <Link
            href="/register"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← {isEnglish ? 'Back to registration' : 'Kembali ke registrasi'}
          </Link>

          <h1 className="mt-8 text-4xl font-black">
            {isEnglish
              ? 'Terms & Conditions'
              : 'Syarat & Ketentuan'}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {isEnglish
              ? 'Last updated: August 15, 2026'
              : 'Terakhir diperbarui: 15 Agustus 2026'}
          </p>

          <div className="mt-10 space-y-10 text-slate-300">

            {/* 1 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '1. Acceptance of Terms'
                  : '1. Penerimaan Ketentuan'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'By creating an account or using SocialPulse, you agree to these Terms & Conditions. If you do not agree with these terms, please do not use the service.'
                  : 'Dengan membuat akun atau menggunakan SocialPulse, Anda menyetujui Syarat & Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan SocialPulse.'}
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '2. SocialPulse Service'
                  : '2. Layanan SocialPulse'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'SocialPulse is a social media analytics platform designed to help businesses monitor, analyze, and understand their social media performance.'
                  : 'SocialPulse adalah platform analytics media sosial yang dirancang untuk membantu bisnis memantau, menganalisis, dan memahami performa media sosial mereka.'}
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '3. Account Registration'
                  : '3. Pendaftaran Akun'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'You are responsible for providing accurate information when creating an account and for maintaining the security of your account credentials.'
                  : 'Anda bertanggung jawab untuk memberikan informasi yang benar saat membuat akun serta menjaga keamanan informasi login akun Anda.'}
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '4. Subscription Plans'
                  : '4. Paket Berlangganan'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'SocialPulse may offer different subscription plans with different features, limits, and pricing. The applicable price will be displayed before you complete a purchase.'
                  : 'SocialPulse dapat menyediakan berbagai paket berlangganan dengan fitur, batas penggunaan, dan harga yang berbeda. Harga yang berlaku akan ditampilkan sebelum Anda menyelesaikan pembelian.'}
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '5. Promotional Pricing'
                  : '5. Harga Promosi'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'Promotional pricing may be available for eligible accounts. Promotional eligibility may be limited to one promotion per account or email address. After the promotional period ends, the regular subscription price will apply.'
                  : 'Harga promosi dapat diberikan kepada akun yang memenuhi syarat. Promo dapat dibatasi satu kali untuk setiap akun atau alamat email. Setelah masa promosi berakhir, harga berlangganan normal akan berlaku.'}
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '6. Social Media Connections'
                  : '6. Koneksi Media Sosial'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'Some SocialPulse features may require you to connect supported social media accounts. You authorize SocialPulse to access the information and data necessary to provide the requested features, subject to the permissions granted through the relevant platform.'
                  : 'Beberapa fitur SocialPulse mungkin memerlukan koneksi dengan akun media sosial yang didukung. Anda memberikan izin kepada SocialPulse untuk mengakses informasi dan data yang diperlukan untuk menyediakan fitur yang diminta, sesuai dengan izin yang diberikan melalui platform terkait.'}
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '7. Prohibited Use'
                  : '7. Penggunaan yang Dilarang'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'You may not use SocialPulse for unlawful activities, unauthorized access, abuse of third-party services, or activities that may interfere with the operation or security of the platform.'
                  : 'Anda tidak boleh menggunakan SocialPulse untuk aktivitas ilegal, akses tanpa izin, penyalahgunaan layanan pihak ketiga, atau aktivitas yang dapat mengganggu operasional maupun keamanan platform.'}
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '8. Service Availability'
                  : '8. Ketersediaan Layanan'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'We aim to keep SocialPulse available and reliable, but we cannot guarantee uninterrupted service. Availability may depend on third-party platforms and infrastructure providers.'
                  : 'Kami berupaya menjaga SocialPulse tetap tersedia dan dapat diandalkan, tetapi kami tidak dapat menjamin layanan akan selalu tersedia tanpa gangguan. Ketersediaan layanan dapat bergantung pada platform pihak ketiga dan penyedia infrastruktur.'}
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '9. Changes to These Terms'
                  : '9. Perubahan Ketentuan'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'We may update these Terms & Conditions from time to time. Updated terms will be published on this page.'
                  : 'Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu. Ketentuan terbaru akan dipublikasikan pada halaman ini.'}
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-xl font-bold text-white">
                {isEnglish
                  ? '10. Contact'
                  : '10. Kontak'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'If you have questions regarding these Terms & Conditions, please contact the SocialPulse support team.'
                  : 'Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi tim dukungan SocialPulse.'}
              </p>
            </section>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="mx-auto flex max-w-4xl justify-between text-sm text-slate-500">

          <span>© 2026 SocialPulse</span>

          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">
              {isEnglish ? 'Privacy Policy' : 'Kebijakan Privasi'}
            </Link>

            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
          </div>

        </div>
      </footer>

    </main>
  )
}
=======
import Link from "next/link"
import { useState } from "react"

export default function TermsPage() {
  const [language, setLanguage] = useState("en")

  const isEnglish = language === "en"

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            SocialPulse
          </Link>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={
                isEnglish
                  ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full px-4 py-2 text-sm font-bold text-slate-400"
              }
            >
              English
            </button>

            <button
              type="button"
              onClick={() => setLanguage("id")}
              className={
                !isEnglish
                  ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full px-4 py-2 text-sm font-bold text-slate-400"
              }
            >
              Indonesia
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-4 text-4xl font-bold">
          {isEnglish ? "Terms & Conditions" : "Syarat dan Ketentuan"}
        </h1>

        <p className="mb-10 text-slate-400">
          {isEnglish
            ? "Last updated: August 2026"
            : "Terakhir diperbarui: Agustus 2026"}
        </p>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "1. Acceptance of Terms" : "1. Penerimaan Ketentuan"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "By creating an account and using SocialPulse, you agree to these Terms & Conditions. If you do not agree with these terms, please do not use the service."
                : "Dengan membuat akun dan menggunakan SocialPulse, Anda menyetujui Syarat dan Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "2. Description of Service" : "2. Deskripsi Layanan"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "SocialPulse provides social media analytics, performance monitoring, reporting, and related business insights through a centralized dashboard."
                : "SocialPulse menyediakan analitik media sosial, pemantauan performa, laporan, dan wawasan bisnis terkait melalui satu dashboard."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "3. User Account" : "3. Akun Pengguna"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "You are responsible for maintaining the confidentiality of your account information and password. You are also responsible for all activity performed through your account."
                : "Anda bertanggung jawab menjaga kerahasiaan informasi akun dan kata sandi Anda. Anda juga bertanggung jawab atas seluruh aktivitas yang dilakukan melalui akun Anda."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "4. Social Media Connections" : "4. Koneksi Media Sosial"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "When you connect a social media account to SocialPulse, you authorize the service to access the information and data permitted by the applicable platform permissions."
                : "Ketika Anda menghubungkan akun media sosial ke SocialPulse, Anda memberikan izin kepada layanan untuk mengakses informasi dan data sesuai dengan izin yang diberikan oleh platform terkait."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "5. Acceptable Use" : "5. Penggunaan yang Diperbolehkan"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "You agree not to use SocialPulse for illegal activities, abuse, fraud, unauthorized access, or activities that may harm the service or other users."
                : "Anda setuju untuk tidak menggunakan SocialPulse untuk kegiatan ilegal, penyalahgunaan, penipuan, akses tanpa izin, atau aktivitas yang dapat merugikan layanan maupun pengguna lain."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "6. Subscription and Payment" : "6. Langganan dan Pembayaran"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "Certain SocialPulse features may require a paid subscription. Subscription fees and applicable billing terms will be displayed before purchase."
                : "Beberapa fitur SocialPulse mungkin memerlukan langganan berbayar. Biaya langganan dan ketentuan pembayaran akan ditampilkan sebelum pembelian."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "7. Service Availability" : "7. Ketersediaan Layanan"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "We aim to keep SocialPulse available and reliable, but we cannot guarantee uninterrupted access at all times."
                : "Kami berupaya menjaga SocialPulse tetap tersedia dan dapat diandalkan, tetapi kami tidak dapat menjamin akses tanpa gangguan setiap saat."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "8. Limitation of Liability" : "8. Batasan Tanggung Jawab"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "SocialPulse is provided on an as-is and as-available basis. To the extent permitted by law, we are not responsible for indirect losses resulting from the use of the service."
                : "SocialPulse disediakan sebagaimana adanya dan sesuai ketersediaannya. Sejauh diizinkan oleh hukum, kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "9. Changes to These Terms" : "9. Perubahan Ketentuan"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "We may update these Terms & Conditions from time to time. Updated terms will be published on this page."
                : "Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu. Ketentuan yang diperbarui akan dipublikasikan pada halaman ini."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {isEnglish ? "10. Contact" : "10. Kontak"}
            </h2>

            <p className="leading-7">
              {isEnglish
                ? "If you have questions about these Terms & Conditions, please contact the SocialPulse administrator."
                : "Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini, silakan hubungi administrator SocialPulse."}
            </p>
          </section>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-sm text-slate-400">
          <p>© 2026 SocialPulse. All rights reserved.</p>

          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>

            <Link href="/terms" className="hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
>>>>>>> 09a0bf807a1e22e9d04ed3de03791e7dfd5be8f4