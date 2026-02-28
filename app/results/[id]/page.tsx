'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'
import { Button } from '@/components/ui/button'
import { Share2, ArrowLeft } from 'lucide-react'

type Project = {
  id: number
  title: string
  categories: string[]
  time_estimate: string
  skill_level: string
  machines_required: string[]
  is_stash_buster: boolean
  image_url?: string
  accuquilt_pattern_url?: string
  notion_instructions_url?: string
}

type CrafterType = {
  title: string
  description: string
  emoji: string
}

type SavedResult = {
  unique_id: string
  email: string
  first_name: string | null
  quiz_answers: any
  matched_projects: Project[]
  crafter_type: CrafterType
  created_at: string
}

export default function SavedResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<SavedResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadResults() {
      const uniqueId = params.id as string

      const { data, error } = await supabase
        .from('saved_results')
        .select('*')
        .eq('unique_id', uniqueId)
        .single()

      if (error || !data) {
        setError(true)
        setIsLoading(false)
        return
      }

      setResult(data)
      setIsLoading(false)
    }

    loadResults()
  }, [params.id])

  const handleShare = () => {
    const text = `Check out my personalized Die Project Finder results! 🎨`
    const url = window.location.href
    
    if (navigator.share) {
      navigator.share({
        title: 'My Die Project Finder Results',
        text: text,
        url: url
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Results link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Results Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find these results. The link may be invalid or expired.
          </p>
          <Button onClick={() => router.push('/quiz')}>
            Take the Quiz
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/quiz')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Take Quiz Again
        </Button>

        {/* Crafter Type Card */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary rounded-lg p-8 mb-8 text-center">
          <div className="text-6xl mb-4">{result.crafter_type.emoji}</div>
          <h1 className="text-3xl font-bold mb-2">
            You're a {result.crafter_type.title}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {result.crafter_type.description}
          </p>
        </div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Your {result.matched_projects.length} Personalized {result.matched_projects.length === 1 ? 'Project' : 'Projects'}
          </h2>
          <p className="text-muted-foreground text-sm">
            Saved on {new Date(result.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 mb-8">
          {result.matched_projects.map((project) => (
            <div
              key={project.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Project image */}
                <div className="w-full md:w-48 h-48 bg-muted rounded-lg overflow-hidden shrink-0">
                  {project.image_url ? (
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">🎨</span>
                    </div>
                  )}
                </div>

                {/* Project details */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.is_stash_buster && (
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        Stash Buster
                      </span>
                    )}
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                      {project.time_estimate}
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                      {project.skill_level}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Categories:</strong> {project.categories.join(', ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Machines:</strong> {project.machines_required.join(', ')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {project.accuquilt_pattern_url && (
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                      >
                        <a href={project.accuquilt_pattern_url} target="_blank" rel="noopener noreferrer">
                          View Pattern
                        </a>
                      </Button>
                    )}
                    {project.notion_instructions_url && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <a href={project.notion_instructions_url} target="_blank" rel="noopener noreferrer">
                          Instructions
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Share Section */}
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h3 className="font-bold mb-2">Love your matches?</h3>
          <p className="text-muted-foreground mb-4">
            Share your personalized results with friends!
          </p>
          <Button onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share My Results
          </Button>
        </div>
      </div>
    </div>
  )
}