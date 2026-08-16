import Link from 'next/link'
import SiteHeader from '@/components/marketing/SiteHeader'
import SiteFooter from '@/components/marketing/SiteFooter'

export default async function TermsPage({ searchParams }) {
  const params = await searchParams
  const language = params?.lang === 'id' ? 'id' : 'en'
  const isEnglish = language === 'en'

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <SiteHeader lang={language} basePath="/terms" variant="full" />

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
              ? 'Terms & Conditions'
              : 'Syarat & Ketentuan'}
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
              <h2 className="text-lg font-semibold text-slate-900">
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
              <h2 className="text-lg font-semibold text-slate-900">
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
              <h2 className="text-lg font-semibold text-slate-900">
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
              <h2 className="text-lg font-semibold text-slate-900">
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
              <h2 className="text-lg font-semibold text-slate-900">
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
              <h2 className="text-lg font-semibold text-slate-900">
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
              <h2 className="text-lg font-semibold text-slate-900">
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
              <h2 className="text-lg font-semibold text-slate-900">
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
              <h2 className="text-lg font-semibold text-slate-900">
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

      <SiteFooter lang={language} />

    </main>
  )
}
