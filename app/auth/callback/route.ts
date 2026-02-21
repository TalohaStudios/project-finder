import { supabase } from '@/app/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to quiz page after successful auth
  return NextResponse.redirect(`${requestUrl.origin}/quiz`)
}