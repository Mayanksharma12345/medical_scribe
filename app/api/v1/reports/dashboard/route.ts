import { type NextRequest, NextResponse } from "next/server"

export const GET = async (request: NextRequest) => {
  try {
    console.log("[v0] Proxying dashboard report request to Python backend")

    // Forward to Python backend
    const response = await fetch("http://localhost:8000/api/v1/reports/dashboard", {
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
    console.error("[v0] Dashboard report proxy error:", error)
    return NextResponse.json({ detail: "Failed to reach backend server" }, { status: 503 })
  }
}
