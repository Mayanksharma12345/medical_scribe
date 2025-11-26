import { type NextRequest, NextResponse } from "next/server"

export const POST = async (request: NextRequest) => {
  try {
    console.log("[v0] Proxying transcribe request to Python backend")

    const formData = await request.formData()

    // Forward to Python backend
    const response = await fetch("http://localhost:8000/api/v1/transcribe/", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log("[v0] Backend error:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Transcribe proxy error:", error)
    return NextResponse.json({ detail: "Failed to reach backend server" }, { status: 503 })
  }
}
