// Weekly performance digest — build HTML email + send logic
import { db, users } from '@/lib/db'
import { getStoredProfile, socialAnalytics } from '@/lib/ayrshare'
import { sendMail, hasSmtp } from '@/lib/mailer'
import { activityCol } from '@/lib/activity'

export async function digestStateCol() {
  return (await db()).collection('digest_state')
}

export async function getDigestState() {
  const col = await digestStateCol()
  return (await col.findOne({ key: 'weekly' })) || { key: 'weekly', enabled: true, hour_wib: 8, recipients_mode: 'admins', custom_recipients: [] }
}

export async function setDigestState(patch) {
  const col = await digestStateCol()
  await col.updateOne({ key: 'weekly' }, { $set: { ...patch, key:'weekly', updated_at: new Date() } }, { upsert: true })
  return getDigestState()
}

/**
 * Collect the top-level numbers used in the weekly digest.
 * Uses Ayrshare aggregate if available; otherwise falls back to activity log summary.
 */
export async function collectDigestData() {
  const now = new Date()
  const since7d = new Date(now.getTime() - 7*86400000)
  const since14d = new Date(now.getTime() - 14*86400000)

  // Live social snapshot via Ayrshare (best effort)
  let ayr = null
  const stored = await getStoredProfile()
  if (stored?.profileKey) {
    try {
      const r = await socialAnalytics(stored.profileKey, ['facebook','instagram','youtube','tiktok'])
      if (r.ok) ayr = r.data
    } catch {}
  }

  // Extract per-platform mini snapshot (with graceful fallbacks)
  const platforms = ['instagram','facebook','youtube','tiktok'].map(k => {
    const p = ayr?.[k]?.analytics || ayr?.[k] || {}
    return {
      key: k,
      name: { instagram:'Instagram', facebook:'Facebook', youtube:'YouTube', tiktok:'TikTok' }[k],
      color: { instagram:'#E1306C', facebook:'#1877F2', youtube:'#FF0000', tiktok:'#111827' }[k],
      followers: p.followersCount ?? p.subscriberCount ?? p.likes ?? p.followers ?? 0,
      engagement: p.engagement ?? ((p.likeCount||0)+(p.commentsCount||0)+(p.shareCount||0)),
      reach: p.reach ?? p.impressions ?? 0,
      posts: p.mediaCount ?? p.videoCount ?? 0,
    }
  })

  // Activity insights
  const act = await activityCol()
  const [total7d, publishSuccess, loginFails, topActions] = await Promise.all([
    act.countDocuments({ ts: { $gte: since7d } }),
    act.countDocuments({ action: { $in: ['ayrshare.publish','ayrshare.schedule'] }, status:'success', ts: { $gte: since7d } }),
    act.countDocuments({ action: 'auth.login', status:'failure', ts: { $gte: since7d } }),
    act.aggregate([
      { $match: { ts: { $gte: since7d } } },
      { $group: { _id: '$action', c: { $sum: 1 } } },
      { $sort: { c: -1 } }, { $limit: 5 },
    ]).toArray(),
  ])

  return {
    period: { from: since7d, to: now, label: `${since7d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'})} — ${now.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}` },
    platforms,
    ayrshareConnected: !!ayr,
    activity: { total7d, publishSuccess, loginFails, topActions: topActions.map(a=>({ action:a._id, count:a.c })) },
  }
}

function fmt(n) {
  const x = +n || 0
  if (x >= 1e9) return (x/1e9).toFixed(1)+'M'
  if (x >= 1e6) return (x/1e6).toFixed(1)+'jt'
  if (x >= 1e3) return (x/1e3).toFixed(1)+'K'
  return String(x)
}

export function buildDigestEmail(data) {
  const brand = '#0B2545'; const accent = '#1D4ED8'
  const subject = `📊 Ringkasan Mingguan Media Sosial · ${data.period.label}`

  const platformRows = data.platforms.map(p => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0">
        <div style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color};margin-right:8px;vertical-align:middle"></div>
        <strong style="color:#0F172A">${p.name}</strong>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:600;color:#0F172A">${fmt(p.followers)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;text-align:right;color:#334155">${fmt(p.engagement)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;text-align:right;color:#334155">${fmt(p.reach)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;text-align:right;color:#334155">${fmt(p.posts)}</td>
    </tr>`).join('')

  const topActionsHtml = data.activity.topActions.length ? data.activity.topActions.map(a =>
    `<li style="margin:4px 0"><span style="font-family:monospace;color:${accent};font-size:11px;background:#EFF6FF;padding:2px 6px;border-radius:4px">${a.action}</span> <span style="color:#64748B;font-size:12px">×${a.count}</span></li>`
  ).join('') : '<li style="color:#94A3B8;font-style:italic">Belum ada aktivitas signifikan minggu ini.</li>'

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F1F5F9;font-family:Segoe UI,Tahoma,sans-serif;color:#0F172A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(15,23,42,0.08)">
  <tr><td style="background:linear-gradient(135deg,${brand} 0%,${accent} 100%);padding:26px 32px;color:#ffffff">
    <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;opacity:.85">Kementerian Pendidikan Dasar dan Menengah</div>
    <div style="font-size:22px;font-weight:800;margin-top:4px">Ringkasan Mingguan Media Sosial</div>
    <div style="font-size:13px;opacity:.85;margin-top:4px">📅 Periode: <strong>${data.period.label}</strong></div>
  </td></tr>

  <tr><td style="padding:24px 32px 8px">
    <h2 style="margin:0 0 6px;font-size:15px;color:#0F172A">📈 Snapshot Platform Sosial</h2>
    <p style="margin:0 0 14px;color:#64748B;font-size:12px">${data.ayrshareConnected ? 'Data live diambil dari Ayrshare untuk akun aktif.' : 'Ayrshare belum menampilkan data live. Hubungkan akun sosial di Settings → API Connections untuk mengaktifkan data live.'}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;font-size:13px">
      <thead style="background:#F8FAFC">
        <tr>
          <th style="text-align:left;padding:10px 12px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Platform</th>
          <th style="text-align:right;padding:10px 12px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Followers</th>
          <th style="text-align:right;padding:10px 12px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Engagement</th>
          <th style="text-align:right;padding:10px 12px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Reach</th>
          <th style="text-align:right;padding:10px 12px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Konten</th>
        </tr>
      </thead>
      <tbody>${platformRows}</tbody>
    </table>
  </td></tr>

  <tr><td style="padding:20px 32px 8px">
    <h2 style="margin:0 0 10px;font-size:15px;color:#0F172A">🔐 Aktivitas Dashboard (7 Hari)</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:10px 0">
      <tr>
        <td style="width:33%;background:#EFF6FF;padding:14px;border-radius:10px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:${accent}">${data.activity.total7d}</div>
          <div style="font-size:10px;text-transform:uppercase;color:#64748B;letter-spacing:.06em;margin-top:2px">Total Aktivitas</div>
        </td>
        <td style="width:33%;background:#ECFDF5;padding:14px;border-radius:10px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:#059669">${data.activity.publishSuccess}</div>
          <div style="font-size:10px;text-transform:uppercase;color:#64748B;letter-spacing:.06em;margin-top:2px">Publish Sukses</div>
        </td>
        <td style="width:33%;background:${data.activity.loginFails>0?'#FEF2F2':'#F1F5F9'};padding:14px;border-radius:10px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:${data.activity.loginFails>0?'#DC2626':'#64748B'}">${data.activity.loginFails}</div>
          <div style="font-size:10px;text-transform:uppercase;color:#64748B;letter-spacing:.06em;margin-top:2px">Login Gagal</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:16px 32px 8px">
    <h3 style="margin:0 0 8px;font-size:13px;color:#0F172A">🏆 Aksi Terbanyak Minggu Ini</h3>
    <ul style="margin:0;padding-left:18px;font-size:12px;color:#475569">${topActionsHtml}</ul>
  </td></tr>

  <tr><td style="padding:20px 32px 26px">
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px">
      <div style="font-size:12px;color:#334155;line-height:1.6">
        💡 <strong>Tips Minggu Depan</strong>:<br>
        • Konsisten publish 3-4 konten per minggu di Instagram & TikTok untuk momentum tertinggi.<br>
        • Konten "Kisah Alumni" dan "Program Prioritas" biasanya menghasilkan engagement tertinggi.<br>
        • Gunakan hashtag <span style="color:${accent};font-weight:600">#KursusVokasi</span> dan <span style="color:${accent};font-weight:600">#KemendikdasmenRI</span> di setiap post.
      </div>
    </div>
  </td></tr>

  <tr><td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0">
    <p style="margin:0;font-size:11px;color:#64748B;line-height:1.6">
      Email ini dikirim otomatis oleh Dashboard Media Sosial Direktorat Kursus dan Pelatihan setiap Senin pagi.<br>
      Untuk berhenti berlangganan atau mengubah pengaturan, buka dashboard → Settings → Notifikasi Email.<br>
      © ${new Date().getFullYear()} Direktorat Kursus dan Pelatihan · Kementerian Pendidikan Dasar dan Menengah RI
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`

  const text = `RINGKASAN MINGGUAN MEDIA SOSIAL - ${data.period.label}

Platform Snapshot:
${data.platforms.map(p => `- ${p.name}: ${fmt(p.followers)} followers, ${fmt(p.engagement)} engagement, ${fmt(p.reach)} reach, ${fmt(p.posts)} konten`).join('\n')}

Aktivitas Dashboard (7 hari):
- Total aktivitas: ${data.activity.total7d}
- Publish sukses: ${data.activity.publishSuccess}
- Login gagal: ${data.activity.loginFails}

-- Direktorat Kursus dan Pelatihan
Kementerian Pendidikan Dasar dan Menengah RI`

  return { subject, html, text }
}

export async function resolveRecipients() {
  const state = await getDigestState()
  if (state.recipients_mode === 'custom' && Array.isArray(state.custom_recipients) && state.custom_recipients.length) {
    return state.custom_recipients.filter(e => /@/.test(e))
  }
  // Default: all active Admin users
  const col = await users()
  const admins = await col.find({ role:'Admin', active: { $ne: false } }, { projection: { email:1 } }).toArray()
  return admins.map(a => a.email).filter(Boolean)
}

export async function sendWeeklyDigest({ preview = false, recipients = null } = {}) {
  const data = await collectDigestData()
  const email = buildDigestEmail(data)
  if (preview) return { ok: true, preview: true, ...email, recipients: recipients || (await resolveRecipients()), data }

  const to = recipients || (await resolveRecipients())
  if (!to.length) return { ok: false, error: 'Tidak ada penerima (Admin aktif tidak ditemukan)' }
  if (!hasSmtp()) return { ok: false, error: 'SMTP belum dikonfigurasi' }

  const results = []
  for (const rcp of to) {
    const r = await sendMail({ to: rcp, subject: email.subject, html: email.html, text: email.text })
    results.push({ to: rcp, ok: r.ok, error: r.error })
  }
  const anyOk = results.some(r => r.ok)
  const now = new Date()
  await setDigestState({ last_sent_at: now, last_sent_recipients: to, last_sent_success: results.filter(r=>r.ok).length, last_sent_total: to.length })
  return { ok: anyOk, sent_at: now, recipients: to, results, subject: email.subject }
}

/**
 * Should we send now? Runs weekly on Monday at configured hour (WIB, UTC+7).
 * Guarded by last_sent_at so we send at most once per week.
 */
export async function shouldAutoSend() {
  const state = await getDigestState()
  if (state.enabled === false) return false
  // Convert now to WIB (UTC+7)
  const nowUtcMs = Date.now()
  const wibMs = nowUtcMs + 7*3600*1000
  const wib = new Date(wibMs)
  const isMonday = wib.getUTCDay() === 1
  if (!isMonday) return false
  const targetHour = +(state.hour_wib || 8)
  const wibHour = wib.getUTCHours()
  // Window: targetHour .. targetHour+2 (accommodate scheduler delays)
  if (wibHour < targetHour || wibHour > targetHour + 2) return false
  // Already sent this week?
  if (state.last_sent_at) {
    const last = new Date(state.last_sent_at)
    const diffHours = (nowUtcMs - last.getTime()) / 3600000
    if (diffHours < 24 * 6) return false // 6-day cooldown
  }
  return true
}
