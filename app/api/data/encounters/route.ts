import { type NextRequest, NextResponse } from "next/server"

export const GET = async (request: NextRequest) => {
  try {
    console.log("[v0] Fetching all encounters for data browser")

    // Forward to Python backend
    const response = await fetch("http://localhost:8000/api/v1/encounters", {
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
    console.error("[v0] Data fetch error:", error)
    return NextResponse.json({ detail: "Failed to reach backend server" }, { status: 503 })
  }
}
