"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Edit2 } from "lucide-react"
import Link from "next/link"

interface SOAPNote {
  id: string
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  icd10_codes: string | null
  cpt_codes: string | null
}

interface Encounter {
  id: string
  physician_id: string
  patient_id_hash: string
  chief_complaint: string
  encounter_type: string
  encounter_date: string
  transcription: string | null
  audio_duration_seconds: number | null
  soap_note: SOAPNote | null
  created_at: string
  updated_at: string
}

export default function EncounterDetail() {
  const params = useParams()
  const router = useRouter()
  const encounterId = params.id as string

  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!encounterId) return

    const fetchEncounter = async () => {
      try {
        console.log(`[v0] Fetching encounter: ${encounterId}`)
        const response = await fetch(`/api/v1/encounters/${encounterId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch encounter")
        }
        const data = await response.json()
        setEncounter(data)
      } catch (err) {
        setError("Failed to load encounter details")
        console.error("[v0] Encounter fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEncounter()
  }, [encounterId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-slate-600">Loading encounter...</p>
        </div>
      </div>
    )
  }

  if (error || !encounter) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{error || "Encounter not found"}</div>
          <Link href="/encounters" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Encounters
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/encounters">
              <Button variant="outline" className="gap-2 mb-4 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Encounters
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">{encounter.chief_complaint || "Encounter"}</h1>
            <p className="mt-2 text-slate-600">{new Date(encounter.created_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Encounter Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-600">Physician</p>
                <p className="font-semibold text-slate-900">{encounter.physician_id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Encounter Type</p>
                <p className="font-semibold text-slate-900 capitalize">{encounter.encounter_type.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Chief Complaint</p>
                <p className="font-semibold text-slate-900">{encounter.chief_complaint}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Audio Duration</p>
                <p className="font-semibold text-slate-900">
                  {encounter.audio_duration_seconds ? `${encounter.audio_duration_seconds} seconds` : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcription */}
        {encounter.transcription && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Transcription</CardTitle>
              <CardDescription>Audio transcribed by Whisper</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-slate-700">{encounter.transcription}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SOAP Notes */}
        {encounter.soap_note ? (
          <div className="space-y-6">
            {/* Medical Codes section */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Codes</CardTitle>
                <CardDescription>ICD-10 diagnosis codes and CPT procedure codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-900">ICD-10 Codes</p>
                    <div className="space-y-2">
                      {encounter.soap_note.icd10_codes ? (
                        JSON.parse(encounter.soap_note.icd10_codes).map((code: string) => (
                          <div key={code} className="rounded-lg bg-blue-50 px-3 py-2">
                            <p className="font-mono text-sm font-semibold text-blue-900">{code}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No ICD-10 codes</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-900">CPT Codes</p>
                    <div className="space-y-2">
                      {encounter.soap_note.cpt_codes ? (
                        JSON.parse(encounter.soap_note.cpt_codes).map((code: string) => (
                          <div key={code} className="rounded-lg bg-green-50 px-3 py-2">
                            <p className="font-mono text-sm font-semibold text-green-900">{code}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No CPT codes</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOAP sections */}
            <div className="grid gap-6 md:grid-cols-2">
              {encounter.soap_note.subjective && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subjective (S)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{encounter.soap_note.subjective}</p>
                  </CardContent>
                </Card>
              )}

              {encounter.soap_note.objective && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Objective (O)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{encounter.soap_note.objective}</p>
                  </CardContent>
                </Card>
              )}

              {encounter.soap_note.assessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assessment (A)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{encounter.soap_note.assessment}</p>
                  </CardContent>
                </Card>
              )}

              {encounter.soap_note.plan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan (P)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{encounter.soap_note.plan}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-600">No SOAP note generated yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

