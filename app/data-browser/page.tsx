"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Encounter {
  id: string
  physician_id: string
  chief_complaint: string
  created_at: string
  transcription: string
  soap_note?: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
}

export default function DataBrowserPage() {
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEncounters = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/data/encounters")

        if (!response.ok) {
          throw new Error(`Failed to fetch encounters: ${response.status}`)
        }

        const data = await response.json()
        setEncounters(data.encounters || [])
      } catch (err) {
        console.error("[v0] Error fetching encounters:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchEncounters()
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4 bg-transparent">
              ← Back Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Data Browser</h1>
          <p className="text-muted-foreground mt-2">View all saved encounters, transcriptions, and SOAP notes</p>
        </div>

        {/* Status */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading encounters...</p>
          </div>
        )}

        {error && (
          <Card className="border-destructive bg-destructive/5 mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && encounters.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No encounters saved yet. Create one to get started!</p>
            </CardContent>
          </Card>
        )}

        {/* Encounters List */}
        {!loading && encounters.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total encounters: <strong>{encounters.length}</strong>
            </p>

            {encounters.map((encounter) => (
              <Card key={encounter.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{encounter.chief_complaint || "No Chief Complaint"}</CardTitle>
                      <CardDescription className="mt-1">ID: {encounter.id}</CardDescription>
                    </div>
                    <Link href={`/encounters/${encounter.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Physician</p>
                      <p className="font-medium">{encounter.physician_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date & Time</p>
                      <p className="font-medium">{new Date(encounter.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {encounter.transcription && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Transcription Preview</p>
                      <div className="bg-muted p-3 rounded text-sm max-h-24 overflow-y-auto">
                        {encounter.transcription}
                      </div>
                    </div>
                  )}

                  {encounter.soap_note && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">SOAP Note</p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {encounter.soap_note.subjective && (
                          <div className="bg-blue-50 p-2 rounded">
                            <strong className="text-blue-900">S:</strong>
                            <p className="text-blue-800 line-clamp-2">{encounter.soap_note.subjective}</p>
                          </div>
                        )}
                        {encounter.soap_note.objective && (
                          <div className="bg-green-50 p-2 rounded">
                            <strong className="text-green-900">O:</strong>
                            <p className="text-green-800 line-clamp-2">{encounter.soap_note.objective}</p>
                          </div>
                        )}
                        {encounter.soap_note.assessment && (
                          <div className="bg-yellow-50 p-2 rounded">
                            <strong className="text-yellow-900">A:</strong>
                            <p className="text-yellow-800 line-clamp-2">{encounter.soap_note.assessment}</p>
                          </div>
                        )}
                        {encounter.soap_note.plan && (
                          <div className="bg-purple-50 p-2 rounded">
                            <strong className="text-purple-900">P:</strong>
                            <p className="text-purple-800 line-clamp-2">{encounter.soap_note.plan}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
