import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const path = (params?.path || []).join('/')
  if (path === 'health' || path === '') {
    return NextResponse.json({ status: 'ok', service: 'dashboard-medsos-direktorat' })
  }
  return NextResponse.json({ error: 'Not found', path }, { status: 404 })
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ received: body })
}
