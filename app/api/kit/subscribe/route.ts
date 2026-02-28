import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, firstName, tags } = body

    const KIT_API_KEY = process.env.NEXT_PUBLIC_KIT_API_KEY
    
    if (!KIT_API_KEY) {
      return NextResponse.json(
        { error: 'Kit API key not configured' },
        { status: 500 }
      )
    }

    // Step 1: Add subscriber to Kit via form
    const formResponse = await fetch('https://api.convertkit.com/v3/forms/9145879/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: KIT_API_KEY,
        email: email,
        first_name: firstName || '',
      }),
    })

    const formData = await formResponse.json()

    if (!formResponse.ok) {
      console.error('Kit form subscribe error:', formData)
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: formResponse.status }
      )
    }

    // Step 2: Get tag IDs and apply tags
    if (tags && tags.length > 0) {
      // Get all tags to find IDs
      const tagsListResponse = await fetch(`https://api.convertkit.com/v3/tags?api_key=${KIT_API_KEY}`)
      const tagsData = await tagsListResponse.json()
      
      if (tagsListResponse.ok && tagsData.tags) {
        // Apply each tag
        for (const tagName of tags) {
          const tag = tagsData.tags.find((t: any) => t.name === tagName)
          if (tag) {
            await fetch(`https://api.convertkit.com/v3/tags/${tag.id}/subscribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                api_key: KIT_API_KEY,
                email: email,
              }),
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: formData })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}