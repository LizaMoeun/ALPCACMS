"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function AlpcaWelcome() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <div className="text-white text-2xl font-bold">
            <Image src="/logo-alpca.png" alt="logo" width={120} height={40} />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => router.push("/posts")}
            >
              View Posts
            </Button>

            <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Log in
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
                <SignInModal onClose={() => setShowSignIn(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">🌟 Welcome to ALPCA!</h1>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <p className="text-lg text-muted-foreground mb-8">
                  Alpca helps you organize and manage all your campus clubs, events, and activities in one place. Schedule posts, track events, and keep your community engaged with ease — all with a touch of alpaca cuteness!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-primary">About Us — Alpca</h3>
                  <p className="space-y-5 text-m text-muted-foreground mb-3">A team gives you the tools to:</p>
                  <ul className="space-y-2 text-s text-muted-foreground list-disc list-inside mb-4">
                    <li>Organize your community work</li>
                    <li>Create and edit content with creativity</li>
                    <li>Manage</li>
                    <li>Publish</li>
                    <li>Create and manage web activities</li>
                    <li>Keep track of community events</li>
                    <li>Set event organizing events as relating to our community</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-primary">Our Mission</h3>
                  <p className="text-m text-muted-foreground mb-2">
                    At Alpca, our mission is to make club and event management simple, joyful, and accessible for every student. We aim to empower campus communities with an easy-to-use platform that organizes activities with a calm and friendly vibe — just like an alpaca. 🦙✨
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Dialog open={showRegister} onOpenChange={setShowRegister}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                      Let&apos;s Sign up with us!
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
                    <RegisterModal onClose={() => setShowRegister(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SignInModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    const success = await login(email, password)
    if (success) {
      onClose()
      router.push("/dashboard")
    } else {
      setError("Invalid email or password")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex">
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Sign In</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-muted-foreground mb-8">Let&apos;s get back to organizing again! Welcome back!</p>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="signin-email">Your email address</Label>
            <Input
              id="signin-email"
              type="email"
              placeholder="Enter your email"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="signin-password">Enter your Password</Label>
            <Input
              id="signin-password"
              type="password"
              placeholder="Enter your password"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="remember" className="rounded" />
            <Label htmlFor="remember" className="text-sm">
              Remember me
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>

      <div className="flex-1 bg-secondary/30 flex items-center justify-center p-8">
        <Image src="/kid-inthesingn-login.png" alt="login illustration" width={400} height={400} className="max-w-full h-auto" />
      </div>
    </div>
  )
}

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    const success = await register(email, username, password)
    if (success) {
      onClose()
      router.push("/dashboard")
    } else {
      setError("User already exists or registration failed")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex">
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Sign up</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-muted-foreground mb-8">It&apos;s our pleasure, time to start a complete new experience!</p>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="register-email">Your email address</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="register-username">Enter your Username</Label>
            <Input
              id="register-username"
              type="text"
              placeholder="Enter your username"
              className="mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="register-password">Enter your Password</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="Enter your password"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="register-confirm">Confirm your Password</Label>
            <Input
              id="register-confirm"
              type="password"
              placeholder="Confirm your password"
              className="mt-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      </div>

      <div className="flex-1 bg-secondary/30 flex items-center justify-center p-8">
        <Image src="/kid-inthesingn-login.png" alt="signup illustration" width={400} height={400} className="max-w-full h-auto" />
      </div>
    </div>
  )
}
