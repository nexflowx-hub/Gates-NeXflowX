import { NextRequest, NextResponse } from "next/server"

const NEXFLOWX_BASE = "https://proxy.nexflowx.tech"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "Missing authorization header" }, { status: 401 })
  }

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 })
  }

  const allowedEndpoints = ["/tower/me", "/tower/nodes", "/relay/capabilities"]
  if (!allowedEndpoints.includes(endpoint)) {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 403 })
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[GATES-PROXY] GET Request -> ${NEXFLOWX_BASE}${endpoint}`)
    console.log(`[GATES-PROXY] Auth Header -> ${authHeader ? "Present (Bearer/Basic)" : "Missing"}`)
  }

  try {
    const response = await fetch(`${NEXFLOWX_BASE}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const data = await response.json()
    if (!response.ok) return NextResponse.json(data, { status: response.status })

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error(`[GATES-PROXY] Connection Error:`, message)
    return NextResponse.json(
      { error: "Gateway connection failed", details: message },
      { status: 502 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "Missing authorization header" }, { status: 401 })
  }

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 })
  }

  const allowedEndpoints = ["/tower/me/security"]
  if (!allowedEndpoints.includes(endpoint)) {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 403 })
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[GATES-PROXY] PATCH Request -> ${NEXFLOWX_BASE}${endpoint}`)
    console.log(`[GATES-PROXY] Auth Header -> ${authHeader ? "Present (Bearer/Basic)" : "Missing"}`)
  }

  try {
    const body = await request.json()
    const response = await fetch(`${NEXFLOWX_BASE}${endpoint}`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    if (!response.ok) return NextResponse.json(data, { status: response.status })

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error(`[GATES-PROXY] Connection Error:`, message)
    return NextResponse.json(
      { error: "Gateway connection failed", details: message },
      { status: 502 }
    )
  }
}
