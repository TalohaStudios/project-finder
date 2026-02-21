"use client"
import { supabase } from './supabase'
import React from "react"

import { useState } from "react"
import { Loader2, Mail, CheckCircle2, Scissors } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function SignUpForm() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)
    const { error: authError } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
  emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

if (authError) {
  setError(authError.message)
  setIsLoading(false)
  return
}
    setIsLoading(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
          <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-foreground">
            Check your email!
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            We sent you a magic link to get started. Click the link in your
            email to create your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-email">
          Email address <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError("")
            }}
            className="pl-10 h-12"
            aria-describedby={error ? "signup-error" : undefined}
            aria-invalid={!!error}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-name">
          First name{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Your first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="h-12"
        />
      </div>

      {error && (
        <p
          id="signup-error"
          className="text-sm text-destructive font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-12 text-base font-semibold mt-1"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creating your account...</span>
          </>
        ) : (
          "Create My Free Account"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        {"We'll never spam you. Unsubscribe anytime."}
      </p>
    </form>
  )
}

function LogInForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)
    const { error: authError } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
  emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

if (authError) {
  setError(authError.message)
  setIsLoading(false)
  return
}
    setIsLoading(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
          <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-foreground">
            Check your email!
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Your login link is on the way. Click the link in your email to
            access your saved projects.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">
          Email address <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError("")
            }}
            className="pl-10 h-12"
            aria-describedby={error ? "login-error" : undefined}
            aria-invalid={!!error}
            required
          />
        </div>
      </div>

      {error && (
        <p
          id="login-error"
          className="text-sm text-destructive font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-12 text-base font-semibold mt-1"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending your link...</span>
          </>
        ) : (
          "Send My Login Link"
        )}
      </Button>
    </form>
  )
}

export default function AuthForm() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Scissors className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
              Fusion Makers
            </span>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              Project Finder
            </h1>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="border-border/60 shadow-lg">
          <Tabs defaultValue="signup" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="signup" className="font-medium">
                  Sign Up
                </TabsTrigger>
                <TabsTrigger value="login" className="font-medium">
                  Log In
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="signup" className="mt-0">
              <div className="px-6 pb-2">
                <CardTitle className="text-xl text-balance">
                  Find Your Perfect Craft Project
                </CardTitle>
                <CardDescription className="mt-2 leading-relaxed">
                  Get personalized project recommendations in under 2 minutes
                </CardDescription>
              </div>
              <CardContent className="pt-4">
                <SignUpForm />
              </CardContent>
            </TabsContent>

            <TabsContent value="login" className="mt-0">
              <div className="px-6 pb-2">
                <CardTitle className="text-xl">Welcome Back!</CardTitle>
                <CardDescription className="mt-2 leading-relaxed">
                  Enter your email to access your saved projects
                </CardDescription>
              </div>
              <CardContent className="pt-4">
                <LogInForm />
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}