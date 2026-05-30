import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const trackingId = searchParams.get('tid')
  const userAgent  = request.headers.get('user-agent') || ''
  const ip         = request.headers.get('x-forwarded-for') || ''

  if (trackingId) {
    try {
      await supabase.from('email_events').insert({
        tracking_id: trackingId,
        event_type:  'opened',
        ip_address:  ip.split(',')[0].trim(),
        user_agent:  userAgent.substring(0, 200)
      })

      await supabase.from('emails')
        .update({ status: 'opened' })
        .eq('tracking_id', trackingId)
        .eq('status', 'sent')
    } catch (e) {
      console.error('Tracking error:', e)
    }
  }

  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  )

  return new NextResponse(pixel, {
    status: 200,
    headers: {
      'Content-Type':  'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma':        'no-cache',
      'Expires':       '0'
    }
  })
}
