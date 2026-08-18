// Email sender via nodemailer SMTP (Gmail App Password)
import nodemailer from 'nodemailer'

let _transporter = null

export function hasSmtp() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS)
}

function transporter() {
  if (_transporter) return _transporter
  if (!hasSmtp()) return null
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: +(process.env.SMTP_PORT || 465),
    secure: (+(process.env.SMTP_PORT || 465)) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return _transporter
}

function fromAddr() {
  const name = process.env.SMTP_FROM_NAME || 'SocialPulse'
  const email = process.env.SMTP_USER
  return `"${name}" <${email}>`
}

export async function sendMail({ to, subject, html, text }) {
  const tx = transporter()
  if (!tx) return { ok: false, skipped: true, reason: 'SMTP not configured' }
  try {
    const info = await tx.sendMail({ from: fromAddr(), to, subject, html, text })
    return { ok: true, id: info?.messageId }
  } catch (e) {
    console.error('sendMail error:', e?.message || e)
    return { ok: false, error: String(e?.message || e) }
  }
}

/* ================= Template: OTP Reset Password ================= */
export function otpEmail({ code, expiresMinutes = 15, name = '' }) {
  const brand = '#0B2545'
  const accent = '#1D4ED8'
  const subject = 'Kode Verifikasi Reset Kata Sandi — SocialPulse'
  const text = `Halo${name?' '+name:''},\n\nBerikut kode verifikasi Anda: ${code}\nKode berlaku ${expiresMinutes} menit.\n\nJika Anda tidak meminta reset kata sandi, abaikan email ini.\n\n— SocialPulse Dashboard`
  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Segoe UI,Tahoma,sans-serif;color:#0F172A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,0.06)">
        <tr>
          <td style="background:linear-gradient(135deg,${brand} 0%,${accent} 100%);padding:24px 32px;color:#ffffff">
            <div style="font-size:20px;font-weight:700;margin-top:4px">SocialPulse</div>
            <div style="font-size:12px;opacity:.85;margin-top:2px">Dashboard Media Sosial · Monitoring, Analisis & Evaluasi Komunikasi Digital</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 8px">
            <h1 style="margin:0;font-size:18px;color:#0F172A">Kode Verifikasi Reset Kata Sandi</h1>
            <p style="margin:12px 0 0;color:#475569;font-size:14px;line-height:1.6">
              Halo${name?' <strong>'+name+'</strong>':''}, kami menerima permintaan reset kata sandi untuk akun Anda di SocialPulse.
              Silakan gunakan kode berikut:
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 32px 8px">
            <div style="display:inline-block;padding:18px 28px;background:#F8FAFC;border:2px dashed ${accent};border-radius:12px;font-size:32px;font-weight:800;letter-spacing:.4em;color:${brand};font-family:Consolas,Menlo,monospace">${code}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 24px">
            <p style="margin:0;color:#64748B;font-size:12px;line-height:1.6">
              ⏱ Kode berlaku selama <strong>${expiresMinutes} menit</strong>.<br>
              🛡️ Jangan bagikan kode ini kepada siapapun.<br>
              🚫 Jika Anda tidak melakukan permintaan reset, abaikan email ini — akun Anda tetap aman.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0">
            <p style="margin:0;font-size:11px;color:#64748B;line-height:1.6">
              Email ini dikirim otomatis oleh sistem SocialPulse.<br>
              © ${new Date().getFullYear()} SocialPulse
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  return { subject, html, text }
}
