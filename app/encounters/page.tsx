"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function Encounters() {
  const [encounters, setEncounters] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEncounters = async () => {
      try {
        const response = await fetch("/api/v1/encounters/")
        const data = await response.json()
        setEncounters(data.encounters || [])
      } catch (error) {
        console.error("Failed to fetch encounters:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEncounters()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Encounters</h1>
            <p className="mt-2 text-slate-600">Manage patient encounters and SOAP notes</p>
          </div>
          <Link href="/encounters/new">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Encounter
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <Input type="search" placeholder="Search encounters..." className="max-w-sm" />
        </div>

        {/* Encounters List */}
        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center">
            <p className="text-slate-600">Loading encounters...</p>
          </div>
        ) : encounters.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-slate-600">No encounters yet. Start recording your first encounter.</p>
              <Link href="/encounters/new" className="mt-4 inline-block">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Create First Encounter
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {encounters.map((encounter: any) => (
              <Link key={encounter.id} href={`/encounters/${encounter.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{encounter.chief_complaint || "Encounter"}</CardTitle>
                        <CardDescription>{new Date(encounter.created_at).toLocaleString()}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          {encounter.soap_note ? "Completed" : "Processing"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        <p>Physician: {encounter.physician_id}</p>
                        <p>Type: {encounter.encounter_type.replace(/_/g, " ")}</p>
                        {encounter.soap_note?.icd10_codes && (
                          <p className="mt-1 text-xs text-blue-600 font-medium">
                            ICD-10: {JSON.parse(encounter.soap_note.icd10_codes).slice(0, 2).join(", ")}
                          </p>
                        )}
                      </div>
                      {encounter.soap_note && (
                        <div className="text-right text-xs text-green-600 font-medium">SOAP Ready</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
