import { NextResponse } from 'next/server'
import { supabase } from '@/app/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventType, eventData } = body

    // Save analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: eventType,
        event_data: eventData || {}
      })

    if (error) {
      console.error('Analytics error:', error)
      // Don't fail the user's action if analytics fails
      return NextResponse.json({ success: false }, { status: 200 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}