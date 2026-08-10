import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const p = await params
  const path = (p?.path || []).join('/')
  if (path === 'health' || path === '') return NextResponse.json({ status: 'ok' })
  return NextResponse.json({ error: 'Not found', path }, { status: 404 })
}

export async function POST(request, { params }) {
  const p = await params
  const path = (p?.path || []).join('/')
  if (path === 'ai-insights') return aiInsights(request)
  return NextResponse.json({ error: 'Not found', path }, { status: 404 })
}

async function aiInsights(request) {
  try {
    const apiKey = process.env.EMERGENT_LLM_KEY
    if (!apiKey) return NextResponse.json({ error: 'EMERGENT_LLM_KEY belum dikonfigurasi' }, { status: 500 })
    const body = await request.json().catch(()=>({}))
    const { context = {}, scope = 'overview' } = body

    const { LlmChat, UserMessage } = await import('emergentintegrations')

    const systemPrompt = `Anda adalah analis komunikasi digital senior untuk Direktorat Kursus dan Pelatihan (Kementerian Pendidikan Dasar dan Menengah Republik Indonesia).
Analisis data JSON yang diberikan dan hasilkan insight dalam Bahasa Indonesia yang jelas untuk pimpinan pemerintahan.

KELUARKAN JSON VALID dengan struktur berikut (tanpa penjelasan tambahan sebelum/sesudah JSON):
{
  "findings": [ ...3-5 poin "What happened?"/"Why did it happen?" berbasis data... ],
  "opportunities": [ ...2-4 peluang komunikasi konkret... ],
  "risks": [ ...1-3 risiko atau isu perlu perhatian... ],
  "actions": [ ...3-5 rekomendasi tindakan konkret (mengapa & apa)... ],
  "ideas": [ ...3-5 ide konten kreatif berikutnya, relevan program vokasi/kursus/sertifikasi... ]
}

ATURAN:
- Setiap item singkat, 1-2 kalimat, sebutkan angka dari data jika relevan.
- Bahasa Indonesia formal namun mudah dipahami pimpinan.
- Jangan mengarang angka yang tidak ada di data.
- Hanya keluarkan JSON, tidak ada markdown \`\`\`.`

    const chat = new LlmChat(apiKey, `medsos-${scope}-${Date.now()}`, systemPrompt)
      .withModel('anthropic','claude-sonnet-4-5')
      .withParams({ temperature: 0.3, max_tokens: 2000 })

    const userText = `Konteks analisis: ${scope}\n\nData:\n${JSON.stringify(context).slice(0, 8000)}`
    const reply = await chat.sendMessage(new UserMessage({ text: userText }))
    const raw = typeof reply === 'string' ? reply : String(reply)
    let clean = raw.replace(/```(?:json)?/gi, '').trim()
    let parsed = null
    try { parsed = JSON.parse(clean) } catch {}
    if (!parsed) {
      const m = clean.match(/\{[\s\S]*\}/)
      if (m) { try { parsed = JSON.parse(m[0]) } catch {} }
    }
    if (!parsed) {
      // Best-effort recovery: try to parse partial JSON by closing brackets
      try {
        const start = clean.indexOf('{')
        if (start >= 0) {
          let s = clean.slice(start)
          // strip incomplete trailing lines
          s = s.replace(/,\s*$/,'').replace(/,\s*\]/g,']')
          if (!s.endsWith('}')) s = s.replace(/,?\s*(\"[^\"]*\"\s*:\s*\[?[^\]}]*)?$/,'') + ']}'.slice(0, (s.match(/\[/g)||[]).length - (s.match(/\]/g)||[]).length) + '}'
          parsed = JSON.parse(s)
        }
      } catch {}
    }
    if (!parsed) return NextResponse.json({ error: 'Parse gagal', raw: raw.slice(0,800) }, { status: 502 })
    return NextResponse.json({ insights: parsed })
  } catch (e) {
    console.error('ai-insights error', e)
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 })
  }
}
