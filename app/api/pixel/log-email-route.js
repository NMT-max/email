import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { tracking_id, company, recipient_email, sent_from, status } = body

    const { error } = await supabase.from('emails').insert({
      tracking_id,
      company,
      recipient_email,
      sent_from,
      status: status || 'sent'
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
