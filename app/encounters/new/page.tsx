"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, Square, Play, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function NewEncounter() {
  const { toast } = useToast()
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioSource, setAudioSource] = useState<"record" | "upload" | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    physicianId: "",
    patientIdHash: "",
    chiefComplaint: "",
    encounterType: "office_visit",
  })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [savedEncounterId, setSavedEncounterId] = useState<string | null>(null)
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate audio file
    const validTypes = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/webm", "audio/ogg", "audio/m4a"]
    if (!validTypes.some((type) => file.type.includes(type)) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a)$/i)) {
      toast({
        title: "Invalid file",
        description: "Please upload an MP3, WAV, WebM, OGG, or M4A audio file",
        variant: "destructive",
      })
      return
    }

    setUploadedFile(file)
    setAudioSource("upload")
    setIsDone(false)
    toast({
      title: "File selected",
      description: `${file.name} ready to transcribe`,
    })
  }

  const submitUploadedFile = async () => {
    if (!uploadedFile) return
    await handleTranscribe()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        setRecordedBlob(audioBlob)
        setIsDone(true)
        stream.getTracks().forEach((track) => track.stop())
        console.log("[v0] Recording complete, blob size:", audioBlob.size)
        toast({
          title: "Recording complete",
          description: "Click 'Transcribe Audio' to process",
        })
      }

      mediaRecorder.start()
      setAudioSource("record")
      setIsRecording(true)
      toast({
        title: "Recording started",
        description: "Click stop when finished",
      })
    } catch (error) {
      console.error("[v0] Recording error:", error)
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsDone(true)
      toast({
        title: "Recording stopped",
        description: "Processing audio...",
      })
    }
  }

  const handleTranscribe = async () => {
    if (!audioSource) {
      toast({
        title: "Error",
        description: "No audio source available",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      const formDataToSend = new FormData()

      const audioBlob =
        audioSource === "upload" && uploadedFile
          ? uploadedFile
          : audioSource === "record" && recordedBlob
            ? recordedBlob
            : null

      if (!audioBlob) {
        throw new Error("No audio available to transcribe")
      }

      const fileName = audioBlob instanceof File ? audioBlob.name : "recording.webm"
      formDataToSend.append("file", audioBlob, fileName)

      console.log("[v0] Sending transcription request...")
      const response = await fetch("/api/v1/transcribe/", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        let errorMessage = "Failed to process recording"
        try {
          const errorData = await response.json()
          errorMessage = errorData?.detail || errorData?.message || errorMessage
        } catch {
          errorMessage = `Error: HTTP ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("[v0] Transcription response:", result)

      const transcriptText = result.transcript || result.transcription || ""

      if (!transcriptText) {
        throw new Error("No transcription text received from server")
      }

      setTranscriptionResult(transcriptText)
      console.log("[v0] Transcription saved to state:", transcriptText.substring(0, 100) + "...")

      toast({
        title: "Success",
        description: "Audio transcribed successfully",
      })
      setIsDone(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process recording"
      console.log("[v0] Transcription error:", message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetAudio = () => {
    setAudioSource(null)
    setUploadedFile(null)
    setIsDone(false)
    setIsRecording(false)
    setTranscriptionResult(null)
    setRecordedBlob(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSaveEncounter = async () => {
    if (!isDone || !audioSource) {
      toast({
        title: "Error",
        description: "Please record or upload audio first",
        variant: "destructive",
      })
      return
    }

    if (!transcriptionResult) {
      toast({
        title: "Error",
        description: "Please transcribe the audio before generating SOAP note",
        variant: "destructive",
      })
      return
    }

    if (!formData.chiefComplaint.trim()) {
      toast({
        title: "Error",
        description: "Please enter a chief complaint",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Saving encounter with:")
    console.log("[v0] - Chief complaint:", formData.chiefComplaint)
    console.log("[v0] - Transcription length:", transcriptionResult.length)

    try {
      setIsProcessing(true)
      const response = await fetch("/api/v1/encounters/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          physician_id: formData.physicianId,
          patient_id_hash: formData.patientIdHash || "default-patient",
          chief_complaint: formData.chiefComplaint,
          encounter_type: formData.encounterType,
          transcription: transcriptionResult,
          generate_soap: true,
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        let errorMessage = "Failed to save encounter"
        try {
          const errorData = await response.json()
          console.log("[v0] Error data:", errorData)
          errorMessage = errorData?.detail || errorData?.message || errorMessage
        } catch {
          errorMessage = `Error: HTTP ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("[v0] Encounter saved:", result.id)
      setSavedEncounterId(result.id)

      setShowSuccessDialog(true)

      // Reset form
      resetAudio()
      setTranscriptionResult(null)
      setFormData({
        physicianId: "",
        patientIdHash: "",
        chiefComplaint: "",
        encounterType: "office_visit",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save encounter"
      console.log("[v0] Save error:", message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">New Encounter</h1>
          <p className="mt-2 text-slate-600">Record or upload patient encounter audio and generate SOAP note</p>
        </div>

        <div className="grid gap-6">
          {/* Audio Input Options */}
          <Card>
            <CardHeader>
              <CardTitle>Audio Input</CardTitle>
              <CardDescription>Choose how to provide the patient encounter audio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Record Audio Option */}
                <button
                  onClick={() => !isRecording && !isDone && setAudioSource("record")}
                  disabled={isRecording || (isDone && audioSource === "record")}
                  className={`rounded-lg border-2 p-4 text-left transition-colors ${
                    audioSource === "record"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <Mic className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Record Audio</p>
                      <p className="text-sm text-slate-600">Mic from your device</p>
                    </div>
                  </div>
                </button>

                {/* Upload Audio Option */}
                <button
                  onClick={() => !isRecording && !isDone && fileInputRef.current?.click()}
                  disabled={isRecording || (isDone && audioSource === "upload")}
                  className={`rounded-lg border-2 p-4 text-left transition-colors ${
                    audioSource === "upload"
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 bg-white hover:border-green-300"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Upload Audio</p>
                      <p className="text-sm text-slate-600">MP3, WAV, WebM, OGG, M4A</p>
                    </div>
                  </div>
                </button>

                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </div>
            </CardContent>
          </Card>

          {/* Recording Card - Show when recording is selected */}
          {audioSource === "record" && (
            <Card>
              <CardHeader>
                <CardTitle>Record Audio</CardTitle>
                <CardDescription>Record the patient encounter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12">
                    <div className="text-center">
                      {!isDone && (
                        <>
                          <div
                            className={`mx-auto mb-4 inline-block rounded-full p-4 ${isRecording ? "bg-red-100" : "bg-blue-100"}`}
                          >
                            <Mic
                              className={`h-8 w-8 ${isRecording ? "text-red-600 animate-pulse" : "text-blue-600"}`}
                            />
                          </div>
                          <p className="text-lg font-semibold text-slate-900">
                            {isRecording ? "Recording..." : "Ready to record"}
                          </p>
                          <p className="text-sm text-slate-600">
                            {isRecording ? "Speaking time is being recorded" : "Click start to begin"}
                          </p>
                        </>
                      )}
                      {isDone && (
                        <>
                          <div className="mx-auto mb-4 inline-block rounded-full bg-green-100 p-4">
                            <Play className="h-8 w-8 text-green-600" />
                          </div>
                          <p className="text-lg font-semibold text-slate-900">Recording complete</p>
                          <p className="text-sm text-slate-600">
                            {isProcessing ? "Processing your audio..." : "Ready to transcribe"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {!isRecording && !isDone && (
                      <Button onClick={startRecording} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                        <Mic className="h-4 w-4" />
                        Start Recording
                      </Button>
                    )}
                    {isRecording && (
                      <Button onClick={stopRecording} variant="destructive" className="w-full gap-2">
                        <Square className="h-4 w-4" />
                        Stop Recording
                      </Button>
                    )}
                    {isDone && !isProcessing && !transcriptionResult && (
                      <>
                        <Button onClick={handleTranscribe} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                          <Play className="h-4 w-4" />
                          Transcribe Audio
                        </Button>
                        <Button onClick={resetAudio} variant="outline" className="flex-1 bg-transparent">
                          Try Again
                        </Button>
                      </>
                    )}
                    {isDone && isProcessing && (
                      <Button disabled className="w-full">
                        Processing...
                      </Button>
                    )}
                    {isDone && !isProcessing && transcriptionResult && (
                      <>
                        <Button onClick={resetAudio} variant="outline" className="w-full bg-transparent">
                          Record Again
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Card - Show when upload is selected */}
          {audioSource === "upload" && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Audio</CardTitle>
                <CardDescription>Upload the patient encounter audio file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12">
                    <div className="text-center">
                      {!isDone && uploadedFile && (
                        <>
                          <div className="mx-auto mb-4 inline-block rounded-full bg-green-100 p-4">
                            <Upload className="h-8 w-8 text-green-600" />
                          </div>
                          <p className="text-lg font-semibold text-slate-900">File selected</p>
                          <p className="text-sm text-slate-600">{uploadedFile.name}</p>
                          <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                      )}
                      {isDone && (
                        <>
                          <div className="mx-auto mb-4 inline-block rounded-full bg-green-100 p-4">
                            <Play className="h-8 w-8 text-green-600" />
                          </div>
                          <p className="text-lg font-semibold text-slate-900">Upload complete</p>
                          <p className="text-sm text-slate-600">
                            {isProcessing ? "Processing your audio..." : "Ready to transcribe"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {!isDone && (
                      <>
                        <Button
                          onClick={submitUploadedFile}
                          disabled={isProcessing}
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Upload className="h-4 w-4" />
                          Process Audio
                        </Button>
                        <Button onClick={resetAudio} variant="outline" className="flex-1 bg-transparent">
                          Change File
                        </Button>
                      </>
                    )}
                    {isDone && isProcessing && (
                      <Button disabled className="w-full">
                        Processing...
                      </Button>
                    )}
                    {isDone && !isProcessing && (
                      <>
                        <Button onClick={resetAudio} variant="outline" className="w-full bg-transparent">
                          Upload Another
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Encounter Details */}
          <Card>
            <CardHeader>
              <CardTitle>Encounter Details</CardTitle>
              <CardDescription>Basic information about this encounter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="physicianId">Physician ID</Label>
                  <Input
                    id="physicianId"
                    placeholder="dr_smith"
                    value={formData.physicianId}
                    onChange={(e) => setFormData({ ...formData, physicianId: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="patientIdHash">Patient ID (Hashed)</Label>
                  <Input
                    id="patientIdHash"
                    placeholder="Patient identifier"
                    value={formData.patientIdHash}
                    onChange={(e) => setFormData({ ...formData, patientIdHash: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="encounterType">Encounter Type</Label>
                  <Select
                    value={formData.encounterType}
                    onValueChange={(value) => setFormData({ ...formData, encounterType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office_visit">Office Visit</SelectItem>
                      <SelectItem value="telehealth">Telehealth</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                  <Textarea
                    id="chiefComplaint"
                    placeholder="Patient's main reason for visit"
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleSaveEncounter}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing || !isDone || !audioSource}
                >
                  Save & Generate SOAP Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SOAP Note Generated Successfully!</DialogTitle>
            <DialogDescription>
              Your encounter has been saved and the SOAP note with ICD-10 codes has been automatically generated.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-green-50 p-4 text-green-800">
              <p className="font-medium">What's included:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>Complete transcription</li>
                <li>SOAP notes (Subjective, Objective, Assessment, Plan)</li>
                <li>ICD-10 diagnosis codes</li>
                <li>CPT procedure codes</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false)
                router.push("/encounters")
              }}
              className="bg-transparent"
            >
              View All Encounters
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false)
                if (savedEncounterId) {
                  router.push(`/encounters/${savedEncounterId}`)
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View SOAP Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
