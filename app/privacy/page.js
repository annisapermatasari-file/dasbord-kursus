import Link from 'next/link'
import SiteHeader from '@/components/marketing/SiteHeader'
import SiteFooter from '@/components/marketing/SiteFooter'

export default async function PrivacyPage({ searchParams }) {
  const params = await searchParams
  const language = params?.lang === 'id' ? 'id' : 'en'
  const isEnglish = language === 'en'

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <SiteHeader lang={language} basePath="/privacy" variant="full" />

      {/* CONTENT */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">

          <Link
            href={`/register?lang=${language}`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← {isEnglish ? 'Back to registration' : 'Kembali ke registrasi'}
          </Link>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {isEnglish
              ? 'Privacy Policy'
              : 'Kebijakan Privasi'}
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            {isEnglish
              ? 'Last updated: August 15, 2026'
              : 'Terakhir diperbarui: 15 Agustus 2026'}
          </p>

          <div className="mt-10 space-y-8 text-slate-600">

            {/* 1 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '1. Introduction'
                  : '1. Pendahuluan'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'SocialPulse respects your privacy and is committed to protecting the information you provide when using our services.'
                  : 'SocialPulse menghormati privasi Anda dan berkomitmen untuk melindungi informasi yang Anda berikan ketika menggunakan layanan kami.'}
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '2. Information We Collect'
                  : '2. Informasi yang Kami Kumpulkan'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'Depending on how you use SocialPulse, we may collect information such as your name, email address, business information, account credentials, subscription information, and information necessary to provide analytics features.'
                  : 'Bergantung pada penggunaan SocialPulse, kami dapat mengumpulkan informasi seperti nama, alamat email, informasi bisnis, informasi akun, informasi langganan, dan informasi yang diperlukan untuk menyediakan fitur analytics.'}
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '3. Social Media Data'
                  : '3. Data Media Sosial'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'If you connect a supported social media account, SocialPulse may process information made available through the permissions you grant. This may include account information, content metrics, audience metrics, engagement information, and other analytics data supported by the connected platform.'
                  : 'Jika Anda menghubungkan akun media sosial yang didukung, SocialPulse dapat memproses informasi yang tersedia berdasarkan izin yang Anda berikan. Informasi tersebut dapat mencakup informasi akun, metrik konten, metrik audiens, informasi engagement, dan data analytics lain yang didukung oleh platform terkait.'}
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '4. How We Use Information'
                  : '4. Bagaimana Kami Menggunakan Informasi'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'We may use information to provide and improve SocialPulse, process subscriptions, provide analytics and AI insights, communicate with users, maintain security, prevent abuse, and provide customer support.'
                  : 'Kami dapat menggunakan informasi untuk menyediakan dan meningkatkan SocialPulse, memproses langganan, menyediakan analytics dan AI insights, berkomunikasi dengan pengguna, menjaga keamanan, mencegah penyalahgunaan, dan menyediakan dukungan pelanggan.'}
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '5. IP Address and Technical Information'
                  : '5. Alamat IP dan Informasi Teknis'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'We may process technical information such as IP address, browser information, device information, and approximate geographic information derived from network information. This information may be used for security, service personalization, language selection, pricing presentation, and service improvement.'
                  : 'Kami dapat memproses informasi teknis seperti alamat IP, informasi browser, informasi perangkat, dan informasi geografis perkiraan yang diperoleh dari informasi jaringan. Informasi ini dapat digunakan untuk keamanan, personalisasi layanan, pemilihan bahasa, tampilan harga, dan peningkatan layanan.'}
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '6. Third-Party Services'
                  : '6. Layanan Pihak Ketiga'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'SocialPulse may use third-party infrastructure, payment providers, analytics services, authentication providers, and social media platforms. Information may be processed by these providers as necessary to provide the requested services.'
                  : 'SocialPulse dapat menggunakan infrastruktur pihak ketiga, penyedia pembayaran, layanan analytics, penyedia autentikasi, dan platform media sosial. Informasi dapat diproses oleh penyedia tersebut sejauh diperlukan untuk menyediakan layanan yang diminta.'}
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '7. Data Security'
                  : '7. Keamanan Data'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'We take reasonable technical and organizational measures to protect information against unauthorized access, alteration, disclosure, or destruction. However, no internet-based service can guarantee absolute security.'
                  : 'Kami mengambil langkah teknis dan organisasi yang wajar untuk melindungi informasi dari akses, perubahan, pengungkapan, atau penghancuran tanpa izin. Namun, tidak ada layanan berbasis internet yang dapat menjamin keamanan secara mutlak.'}
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '8. Data Retention'
                  : '8. Penyimpanan Data'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'We retain information for as long as reasonably necessary to provide the service, meet legal obligations, resolve disputes, and maintain legitimate business records.'
                  : 'Kami menyimpan informasi selama diperlukan secara wajar untuk menyediakan layanan, memenuhi kewajiban hukum, menyelesaikan sengketa, dan menjaga catatan bisnis yang diperlukan.'}
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '9. Your Choices'
                  : '9. Pilihan Anda'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'You may request information about your account data and, where applicable, request correction or deletion of personal information, subject to legal and operational requirements.'
                  : 'Anda dapat meminta informasi mengenai data akun Anda dan, jika berlaku, meminta koreksi atau penghapusan informasi pribadi, dengan tetap memperhatikan persyaratan hukum dan operasional.'}
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '10. Changes to This Privacy Policy'
                  : '10. Perubahan Kebijakan Privasi'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'We may update this Privacy Policy from time to time. The latest version will be published on this page.'
                  : 'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Versi terbaru akan dipublikasikan pada halaman ini.'}
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEnglish
                  ? '11. Contact'
                  : '11. Kontak'}
              </h2>

              <p className="mt-3 leading-7">
                {isEnglish
                  ? 'If you have questions about this Privacy Policy or your personal information, please contact the SocialPulse support team.'
                  : 'Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau informasi pribadi Anda, silakan hubungi tim dukungan SocialPulse.'}
              </p>
            </section>

          </div>

        </div>
      </section>

      <SiteFooter lang={language} />

    </main>
  )
}