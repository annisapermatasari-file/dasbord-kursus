"use client"

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