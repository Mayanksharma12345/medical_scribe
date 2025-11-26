"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, FileText, BarChart3, Plus, LogOut } from "lucide-react"
import Link from "next/link"
import { logout } from "@/lib/auth"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Medical Scribe AI</h1>
                <p className="text-sm text-slate-600">HIPAA-Compliant Clinical Documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/encounters">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  New Encounter
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">Welcome to Medical Scribe AI</h2>
          <p className="mb-6 text-lg text-slate-600">
            Streamline your clinical documentation with AI-powered transcription and SOAP note generation.
          </p>
          <div className="flex gap-4">
            <Link href="/encounters/new">
              <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                <BarChart3 className="h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Transcription Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mb-4 inline-block rounded-lg bg-blue-100 p-3">
                <Mic className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Audio Transcription</CardTitle>
              <CardDescription>Convert physician-patient conversations to text</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                Powered by Azure Whisper with 95%+ accuracy. Supports multiple audio formats.
              </p>
              <Link href="/encounters/new">
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* SOAP Note Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mb-4 inline-block rounded-lg bg-green-100 p-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>SOAP Note Generation</CardTitle>
              <CardDescription>Automatic clinical documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                GPT-4 powered SOAP note generation with ICD-10 code suggestions in seconds.
              </p>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                View Examples
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mb-4 inline-block rounded-lg bg-purple-100 p-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>Track productivity and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                Real-time dashboards, compliance audits, and physician productivity reports.
              </p>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full bg-transparent">
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">4.2 min</div>
            <p className="text-sm text-slate-600">Avg time saved per encounter</p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">95%+</div>
            <p className="text-sm text-slate-600">Transcription accuracy</p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-purple-600">HIPAA</div>
            <p className="text-sm text-slate-600">Fully compliant</p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <p className="text-sm text-slate-600">System uptime</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-center text-white shadow-lg">
          <h3 className="mb-4 text-2xl font-bold">Ready to streamline your documentation?</h3>
          <p className="mb-6 text-lg opacity-90">Start recording your next patient encounter now.</p>
          <Link href="/encounters/new">
            <Button size="lg" variant="secondary" className="gap-2">
              <Mic className="h-5 w-5" />
              Start Now
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
