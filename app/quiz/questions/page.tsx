'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { matchProjects } from './matchProjects'

type QuizAnswers = {
  projectTypes: string[]
  mood: string
  machines: string[]
}

export default function QuizQuestionsPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answers, setAnswers] = useState<QuizAnswers>({
    projectTypes: [],
    mood: '',
    machines: [],
  })

  const handleProjectTypeToggle = (type: string) => {
    setAnswers(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter(t => t !== type)
        : [...prev.projectTypes, type]
    }))
  }

  const handleMoodSelect = (mood: string) => {
    setAnswers(prev => ({ ...prev, mood }))
  }

  const handleMachineToggle = (machine: string) => {
    setAnswers(prev => ({
      ...prev,
      machines: prev.machines.includes(machine)
        ? prev.machines.filter(m => m !== machine)
        : [...prev.machines, machine]
    }))
  }

  const canProceed = () => {
    if (currentQuestion === 1) return answers.projectTypes.length > 0
    if (currentQuestion === 2) return answers.mood !== ''
    if (currentQuestion === 3) return answers.machines.length > 0
    return false
  }

  const handleNext = async () => {
    if (currentQuestion < 3) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Get matched projects
      const matches = await matchProjects(answers)
      console.log('Matched projects:', matches)
      
      // Navigate to results page with data
      const answersParam = encodeURIComponent(JSON.stringify(answers))
      const projectsParam = encodeURIComponent(JSON.stringify(matches))
      
      router.push(`/quiz/results?answers=${answersParam}&projects=${projectsParam}`)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1)
    } else {
      router.push('/quiz')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Question {currentQuestion} of 3</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentQuestion / 3) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentQuestion / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Question 1: Project Types */}
        {currentQuestion === 1 && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-2">What type of project are you looking to make?</h2>
            <p className="text-muted-foreground mb-6">Select all that apply</p>
            
            <div className="space-y-3">
              {[
                { value: 'gifts', label: 'Personalized gifts' },
                { value: 'home-decor', label: 'Home decor items' },
                { value: 'kitchen', label: 'Kitchen accessories' },
                { value: 'baby-kids', label: 'Baby/kids items' },
                { value: 'seasonal', label: 'Seasonal decorations' },
                { value: 'surprise', label: 'Surprise me!' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleProjectTypeToggle(option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers.projectTypes.includes(option.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      answers.projectTypes.includes(option.value)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {answers.projectTypes.includes(option.value) && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 2: Mood/Time */}
        {currentQuestion === 2 && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-2">What sounds good to you right now?</h2>
            <p className="text-muted-foreground mb-6">Choose one</p>
            
            <div className="space-y-3">
              {[
                { value: 'stash-buster', label: 'A project to bust up my fabric stash' },
                { value: 'take-time', label: 'A project worth taking my time on' },
                { value: 'quick', label: 'A quick project I can finish today' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMoodSelect(option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers.mood === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers.mood === option.value
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {answers.mood === option.value && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 3: Machines */}
        {currentQuestion === 3 && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-2">Which machines do you have?</h2>
            <p className="text-muted-foreground mb-6">Select all that apply</p>
            
            <div className="space-y-3">
              {[
                { value: 'accuquilt', label: 'AccuQuilt die cutting system' },
                { value: 'embroidery', label: 'Embroidery machine' },
                { value: 'scan-n-cut', label: 'Scan N Cut (or similar cutting machine)' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMachineToggle(option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers.machines.includes(option.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      answers.machines.includes(option.value)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {answers.machines.includes(option.value) && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            {currentQuestion === 3 ? 'See My Matches' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}