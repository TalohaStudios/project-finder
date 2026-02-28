import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, firstName, tags, answers } = body

    const KIT_API_KEY = process.env.NEXT_PUBLIC_KIT_API_KEY
    
    if (!KIT_API_KEY) {
      return NextResponse.json(
        { error: 'Kit API key not configured' },
        { status: 500 }
      )
    }

    // Add subscriber to Kit
    const response = await fetch('https://api.convertkit.com/v3/forms/9145879/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: KIT_API_KEY,
        email: email,
        first_name: firstName || '',
        tags: tags || [],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Kit API error:', data)
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}