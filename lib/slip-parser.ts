export interface ParsedSlip {
  symbol: string
  price: number
  quantity: number
  amount: number
  date: string // YYYY-MM-DD
}

const PROMPT = `You are a parser for KKP Dime! brokerage slip OCR text. The slips are for US ETF purchases: SCHG, SMH, AVUV, or GLDM.

The OCR text is messy Thai+English. Extract these fields and return ONLY plain JSON:
{"symbol":"<TICKER>","price":<USD>,"quantity":<shares>,"amount":<USD>,"date":"YYYY-MM-DD"}

How to find each field:
- "symbol": One of SCHG, SMH, AVUV, GLDM. Look for "ซื้อ SCHG" or "ซื้อ SMH" etc. Ignore order IDs like STKBML...
- "price": The "ราคาที่ได้จริง" value — this is the actual execution price per share in USD. It is NOT the THB price. Look for a number near "USD" that looks like a stock price (e.g. 29.47, 395.38, 25.12, 80.55).
- "quantity": The "จำนวนหุ้น" value — fractional shares like 0.0232433 or 0.4162426.
- "amount": The "จำนวนเงิน (USD)" value — total USD spent, a small number like 9.20 or 12.27.
- "date": The "วันที่สั่งซื้อ" or slip date. Thai Buddhist year must subtract 543. Example: "1 เม.ย. 69" = 2026-04-01, "28 มี.ค. 69" = 2026-03-28.

Return plain JSON only. No markdown, no explanation.`

function validateAndClean(content: string): ParsedSlip {
  const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const parsed: ParsedSlip = JSON.parse(cleaned)

  const validSymbols = ['SCHG', 'SMH', 'AVUV', 'GLDM']
  const sym = parsed.symbol?.toUpperCase().trim()

  if (!sym || typeof parsed.price !== 'number' || typeof parsed.quantity !== 'number') {
    throw new Error(`Incomplete data: ${JSON.stringify(parsed)}`)
  }

  // Auto-correct symbol if OCR garbled it
  const corrected = validSymbols.find((s) => sym.includes(s)) ?? sym

  return {
    symbol: corrected,
    price: Math.round(parsed.price * 100) / 100,
    quantity: parsed.quantity,
    amount: parsed.amount ?? Math.round(parsed.price * parsed.quantity * 100) / 100,
    date: parsed.date,
  }
}

export async function parseSlipText(ocrText: string): Promise<ParsedSlip> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set')

  if (!ocrText || ocrText.trim().length < 10) {
    throw new Error('OCR text too short — ลองถ่ายรูปใหม่ให้ชัดขึ้น')
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: PROMPT },
        { role: 'user', content: ocrText },
      ],
      max_tokens: 200,
      temperature: 0,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`DeepSeek error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('No response from DeepSeek')
  return validateAndClean(content)
}

export async function parseMultipleSlipTexts(ocrTexts: string[]): Promise<ParsedSlip[]> {
  const results: ParsedSlip[] = []
  for (const text of ocrTexts) { results.push(await parseSlipText(text)) }
  return results
}
