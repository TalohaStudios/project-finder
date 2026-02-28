'use client'

import { useEffect, useState, Suspense } from 'react'
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
  image_url?: string
  accuquilt_pattern_url?: string
  notion_instructions_url?: string
}

type CrafterType = {
  title: string
  description: string
  emoji: string
}


function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [crafterType, setCrafterType] = useState<CrafterType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)

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
        title:'Speed Crafter' ,
        emoji: '⚡',
        description: "You love the satisfaction of finishing projects fast! Quick, beautiful, and rewarding - that's your crafting style."
      }
    } else if (answers.mood === 'take-time') {
      return {
        title: 'Masterpiece Maker',
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
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Step 1: Save results and get unique URL
      const saveResponse = await fetch('/api/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          quizAnswers: JSON.parse(searchParams.get('answers') || '{}'),
          matchedProjects: projects,
          crafterType: crafterType
        })
      })

      if (!saveResponse.ok) {
        alert('Failed to save results. Please try again.')
        setIsSubmitting(false)
        return
      }

      const { resultsUrl } = await saveResponse.json()

      // Step 2: Subscribe to Kit with results URL
      const tags = []
      if (crafterType) {
        const typeTag = crafterType.title.toLowerCase().replace(/\s+/g, '-')
        tags.push(typeTag)
      }

      const kitResponse = await fetch('/api/kit/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          tags,
          resultsUrl // Pass the unique URL to Kit
        })
      })

      if (kitResponse.ok) {
        setEmailSuccess(true)
        setEmail('')
        setFirstName('')
      } else {
        alert('Failed to subscribe. Please try again.')
      }
    } catch (error) {
      console.error('Email submit error:', error)
      alert('Failed to save email. Please try again.')
    } finally {
      setIsSubmitting(false)
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

       {/* Email Capture Section */}
        {projects.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            {!emailSuccess ? (
              <>
                <h3 className="font-bold text-center mb-2">Want these results emailed to you?</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Get your personalized project matches delivered to your inbox!
                </p>
                
                <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name (optional)"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {isSubmitting ? 'Sending...' : 'Email Me My Matches'}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground mb-3">Or share with friends:</p>
                  <Button onClick={handleShare} variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Results
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="font-bold mb-2">Success!</h3>
                <p className="text-muted-foreground">
                  Check your inbox for your personalized project matches!
                </p>
              </div>
            )}
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

// Wrap in Suspense boundary
export default function ResultsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ResultsPage />
    </Suspense>
  )
}