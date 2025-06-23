import { NextResponse } from "next/server"

// Mock exchange rates - in production, use a real API like exchangerate-api.com
const mockRates = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
}

export async function GET() {
  try {
    // In production, fetch from a real exchange rate API
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    // const data = await response.json()

    return NextResponse.json({
      base: "USD",
      rates: mockRates,
      timestamp: Date.now(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 500 })
  }
}
