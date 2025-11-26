import { type NextRequest, NextResponse } from "next/server"

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: encounterId } = await params
    console.log(`[v0] Fetching encounter details for ${encounterId}`)

    const response = await fetch(`http://localhost:8000/api/v1/encounters/${encounterId}`, {
      method: "GET",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log("[v0] Backend error:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Encounter detail proxy error:", error)
    return NextResponse.json({ detail: "Failed to reach backend server" }, { status: 503 })
  }
}
