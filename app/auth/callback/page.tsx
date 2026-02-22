'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Get the hash fragment from URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      // Set the session
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(() => {
        // Redirect to quiz
        router.push('/quiz')
      })
    } else {
      // No tokens, redirect to home
      router.push('/')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Logging you in...</p>
      </div>
    </div>
  )
}