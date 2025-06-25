import { type NextRequest, NextResponse } from "next/server"

const mockRates: Record<string, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")?.toUpperCase()
  const to = searchParams.get("to")?.toUpperCase()
  const amount = Number.parseFloat(searchParams.get("amount") || "1")

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from or to currency" }, { status: 400 })
  }

  if (!mockRates[from] || !mockRates[to]) {
    return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
  }

  try {
    // Convert from base currency (USD) to target
    const usdAmount = amount / mockRates[from]
    const convertedAmount = usdAmount * mockRates[to]

    return NextResponse.json({
      from,
      to,
      amount,
      converted: Math.round(convertedAmount * 100) / 100,
      rate: mockRates[to] / mockRates[from],
    })
  } catch (error) {
    return NextResponse.json({ error: "Conversion failed" + error }, { status: 500 })
  }
}
