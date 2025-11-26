import { type NextRequest, NextResponse } from "next/server"

export const GET = async (request: NextRequest) => {
  try {
    console.log("[v0] Proxying encounters request to Python backend")

    // Forward to Python backend
    const response = await fetch("http://localhost:8000/api/v1/encounters/", {
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
    console.error("[v0] Encounters proxy error:", error)
    return NextResponse.json({ detail: "Failed to reach backend server" }, { status: 503 })
  }
}

export const POST = async (request: NextRequest) => {
  try {
    console.log("[v0] Proxying encounter creation to Python backend")

    const body = await request.json()

    // Forward to Python backend
    const response = await fetch("http://localhost:8000/api/v1/encounters/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log("[v0] Backend error:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Encounter creation proxy error:", error)
    return NextResponse.json({ detail: "Failed to reach backend server" }, { status: 503 })
  }
}
