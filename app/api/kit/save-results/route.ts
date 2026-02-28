import { NextResponse } from 'next/server'
import { supabase } from '@/app/supabase'

// Generate random unique ID (simple version)
function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, firstName, quizAnswers, matchedProjects, crafterType } = body

    // Generate unique ID
    const uniqueId = generateUniqueId()

    // Save to database
    const { data, error } = await supabase
      .from('saved_results')
      .insert({
        unique_id: uniqueId,
        email: email,
        first_name: firstName || null,
        quiz_answers: quizAnswers,
        matched_projects: matchedProjects,
        crafter_type: crafterType,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving results:', error)
      return NextResponse.json(
        { error: 'Failed to save results' },
        { status: 500 }
      )
    }

    // Generate results URL
    const resultsUrl = `https://dieprojectfinder.com/results/${uniqueId}`

    return NextResponse.json({ 
      success: true, 
      uniqueId,
      resultsUrl 
    })
  } catch (error) {
    console.error('Save results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}