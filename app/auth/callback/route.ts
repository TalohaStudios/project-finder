import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce'
        }
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Set auth cookies
        cookieStore.set('sb-access-token', session.access_token, {
          path: '/',
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        cookieStore.set('sb-refresh-token', session.refresh_token, {
          path: '/',
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
      }
    }
  }

  // Redirect to quiz page
  return NextResponse.redirect(`${requestUrl.origin}/quiz`)
}