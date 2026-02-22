'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Share2, Mail, ArrowLeft } from 'lucide-react'

type Project = {
  id: number
  title: string
  categories: string[]
  time_estimate: string
  skill_level: string
  machines_required: string[]
  is_stash_buster: boolean
  accuquilt_pattern_url?: string
  notion_instructions_url?: string
}

type CrafterType = {
  title: string
  description: string
  emoji: string
}

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [crafterType, setCrafterType] = useState<CrafterType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get quiz answers from URL params
    const answersParam = searchParams.get('answers')
    if (!answersParam) {
      router.push('/quiz')
      return
    }

    try {
      const answers = JSON.parse(decodeURIComponent(answersParam))
      
      // Determine crafter type based on answers
      const type = determineCrafterType(answers)
      setCrafterType(type)

      // Get matched projects (passed from previous page)
      const projectsParam = searchParams.get('projects')
      if (projectsParam) {
        const matchedProjects = JSON.parse(decodeURIComponent(projectsParam))
        setProjects(matchedProjects)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error parsing results:', error)
      router.push('/quiz')
    }
  }, [searchParams, router])

  const determineCrafterType = (answers: any): CrafterType => {
    // Determine personality based on quiz answers
    if (answers.mood === 'stash-buster') {
      return {
        title: 'Stash Buster Extraordinaire',
        emoji: '♻️',
        description: "You're a resourceful crafter who loves using what you already have! Your fabric stash doesn't stand a chance against your creativity."
      }
    } else if (answers.mood === 'quick') {
      return {
        title: 'Quick Win Queen',
        emoji: '⚡',
        description: "You love the satisfaction of finishing projects fast! Quick, beautiful, and rewarding - that's your crafting style."
      }
    } else if (answers.mood === 'take-time') {
      return {
        title: 'Patient Perfectionist',
        emoji: '🎨',
        description: "You appreciate the journey as much as the destination. Your projects are labors of love worth every stitch!"
      }
    } else {
      return {
        title: 'Creative Maker',
        emoji: '✨',
        description: "You're ready to create something special! Your AccuQuilt dies are about to make magic."
      }
    }
  }

  const handleShare = () => {
    const text = `I just found ${projects.length} perfect projects on Die Project Finder! 🎨 Find yours at dieprojectfinder.com`
    
    if (navigator.share) {
      navigator.share({
        title: 'Die Project Finder Results',
        text: text,
        url: 'https://dieprojectfinder.com'
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text + ' https://dieprojectfinder.com')
      alert('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/quiz/questions')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quiz
        </Button>

        {/* Crafter Type Card */}
        {crafterType && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary rounded-lg p-8 mb-8 text-center">
            <div className="text-6xl mb-4">{crafterType.emoji}</div>
            <h1 className="text-3xl font-bold mb-2">
              You're a {crafterType.title}!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {crafterType.description}
            </p>
          </div>
        )}

        {/* Results Count */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            We found {projects.length} perfect {projects.length === 1 ? 'project' : 'projects'} for you!
          </h2>
          <p className="text-muted-foreground">
            Here are your personalized project matches
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid gap-6 mb-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Project placeholder image */}
                  <div className="w-full md:w-48 h-48 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-4xl">🎨</span>
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
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">
              No projects found matching your criteria
            </p>
            <Button onClick={() => router.push('/quiz/questions')}>
              Try Different Answers
            </Button>
          </div>
        )}

        {/* Share Section */}
        {projects.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <h3 className="font-bold mb-2">Love your matches?</h3>
            <p className="text-muted-foreground mb-4">
              Share Die Project Finder with your crafting friends!
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Results
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Me My Matches
              </Button>
            </div>
          </div>
        )}

        {/* Start Over */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/quiz')}
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}