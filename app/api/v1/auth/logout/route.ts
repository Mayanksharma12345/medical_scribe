import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { session_token } = await request.json()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/logout?session_token=${session_token}`,
      {
        method: "POST",
      },
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ detail: "Failed to logout" }, { status: 500 })
  }
}
