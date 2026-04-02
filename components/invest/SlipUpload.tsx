'use client'

import { useRef, useState } from 'react'

interface ParsedTrade {
  symbol: string
  price: number
  quantity: number
  amount: number
  date: string
  tradeId: string
  portfolioId: string
}

export default function SlipUpload({ onSuccess }: { onSuccess: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [dataUrls, setDataUrls] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'ocr' | 'ai' | 'done' | 'error'>('idle')
  const [ocrProgress, setOcrProgress] = useState('')
  const [results, setResults] = useState<ParsedTrade[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)

    const newPreviews: string[] = []
    const newDataUrls: string[] = []
    let loaded = 0
    const total = Math.min(files.length, 10)

    Array.from(files).slice(0, 10).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        newPreviews.push(dataUrl)
        newDataUrls.push(dataUrl)
        loaded++
        if (loaded === total) {
          setPreviews((prev) => [...prev, ...newPreviews])
          setDataUrls((prev) => [...prev, ...newDataUrls])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setDataUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleParse = async () => {
    if (dataUrls.length === 0) return
    setError(null)
    setResults([])

    // Step 1: OCR client-side
    setStatus('ocr')
    const ocrTexts: string[] = []
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng+tha')
      for (let i = 0; i < dataUrls.length; i++) {
        setOcrProgress(`OCR ${i + 1}/${dataUrls.length}...`)
        const { data } = await worker.recognize(dataUrls[i])
        ocrTexts.push(data.text)
      }
      await worker.terminate()
    } catch (err) {
      setError(`OCR ล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setStatus('error')
      return
    }

    // Step 2: Send to DeepSeek
    setStatus('ai')
    try {
      const res = await fetch('/api/slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: ocrTexts }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')
      setResults(data.trades)
      setStatus('done')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      setStatus('error')
    }
  }

  const reset = () => {
    setPreviews([])
    setDataUrls([])
    setResults([])
    setStatus('idle')
    setError(null)
    setOcrProgress('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const symbolColors: Record<string, string> = { SCHG: '#38bdf8', SMH: '#818cf8', AVUV: '#22d3a0', GLDM: '#fbbf24' }
  const getColor = (sym: string) => symbolColors[sym.toUpperCase()] ?? 'var(--accent2)'

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 4 }}>อัพโหลดสลิป</p>
        <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>อ่านสลิปซื้อหุ้นอัตโนมัติ</h2>
      </div>

      {(status === 'idle' || status === 'error') && (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)' }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border2)' }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border2)'; handleFiles(e.dataTransfer.files) }}
            style={{
              border: '2px dashed var(--border2)', borderRadius: 'var(--radius-lg)',
              padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
              transition: 'border-color 0.15s', marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>คลิกหรือลากสลิปมาวางที่นี่</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>รองรับ JPG, PNG สูงสุด 10 รูป</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />

          {previews.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: 64, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border2)' }}>
                    <img src={src} alt={`slip-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                      style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleParse}
                  style={{ flex: 1, padding: '10px 18px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', boxShadow: '0 1px 10px rgba(99,102,241,0.3)' }}
                >
                  ⚡ อ่านสลิป ({previews.length} รูป)
                </button>
                <button
                  onClick={reset}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border2)' }}
                >
                  ล้าง
                </button>
              </div>
            </div>
          )}

          {error && (
            <div style={{ borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 13, border: '1px solid', background: 'var(--red2)', borderColor: 'rgba(248,113,113,0.25)', color: 'var(--red)', whiteSpace: 'pre-wrap' }}>
              {error}
            </div>
          )}
        </>
      )}

      {status === 'ocr' && (
        <div style={{ textAlign: 'center', padding: '28px 0' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 14px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>กำลังอ่านข้อความจากรูป...</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{ocrProgress}</p>
        </div>
      )}

      {status === 'ai' && (
        <div style={{ textAlign: 'center', padding: '28px 0' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 14px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>AI กำลังวิเคราะห์ข้อมูล...</p>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>DeepSeek กำลังแปลงข้อมูล...</p>
        </div>
      )}

      {status === 'done' && (
        <div>
          <div style={{ borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 13, border: '1px solid', background: 'var(--green2)', borderColor: 'rgba(34,211,160,0.25)', color: 'var(--green)', marginBottom: 14 }}>
            ✓ อ่านและบันทึกสำเร็จ {results.length} รายการ
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {results.map((r, i) => {
              const c = getColor(r.symbol)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: `${c}22`, color: c }}>{r.symbol}</span>
                  <span style={{ flex: 1, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text2)' }}>
                    {r.quantity.toFixed(4)} × ${r.price.toFixed(2)}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    ${r.amount.toFixed(2)}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>{r.date}</span>
                </div>
              )
            })}
          </div>

          <button
            onClick={reset}
            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border2)' }}
          >
            อัพโหลดเพิ่ม
          </button>
        </div>
      )}
    </div>
  )
}
