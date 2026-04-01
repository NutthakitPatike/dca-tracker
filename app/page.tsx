import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(34,211,160,0.05) 0%, transparent 50%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px',
    }}>
      <div style={{ width: 'min(100%, 960px)', display: 'grid', gridTemplateColumns: 'minmax(280px,340px) 1fr', gap: 28, alignItems: 'stretch' }}>
        {/* Login box */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '44px 36px', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 6, background: 'linear-gradient(135deg, #818cf8, #22d3a0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DCAport
          </div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 28, lineHeight: 1.7 }}>
            ติดตามพอร์ต ETF · บันทึกรายรับ-รายจ่าย · ดู P&L แบบ real-time
          </p>
          <ul style={{ listStyle: 'none', paddingLeft: 0, margin: '0 0 28px', color: 'var(--text2)', textAlign: 'left' }}>
            {['บันทึก DCA อัตโนมัติตาม % allocation', 'ติดตาม Unrealized P&L ทุก ETF', 'ระบบรายรับ-รายจ่ายพร้อม pagination'].map((item) => (
              <li key={item} style={{ marginBottom: 10, paddingLeft: 22, position: 'relative', fontSize: 13 }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>•</span>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/finance" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 'var(--radius)',
              background: 'var(--accent)', color: '#fff',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 1px 10px rgba(99,102,241,0.3)',
            }}>
              📊 เข้าสู่แดชบอร์ด
            </Link>
            <Link href="/invest" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 'var(--radius)',
              background: 'var(--surface2)', color: 'var(--text)',
              border: '1px solid var(--border3)',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}>
              📈 พอร์ต DCA
            </Link>
          </div>
        </div>

        {/* Preview panel */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>ตัวอย่างแดชบอร์ด</p>
          {[
            { label: 'Portfolio Value', value: '$12,340', color: 'var(--text)' },
            { label: 'Unrealized P&L', value: '+$1,250 (11.28%)', color: 'var(--green)' },
            { label: 'ยอดคงเหลือ', value: '฿42,500', color: 'var(--text)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
              <span>{label}</span><strong style={{ color }}>{value}</strong>
            </div>
          ))}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, height: 120, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(180deg, rgba(99,102,241,0.18), rgba(34,211,160,0.3))', borderRadius: '16px 16px 0 0' }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>ข้อมูลทั้งหมดเก็บบนฐานข้อมูลของคุณ — ปลอดภัยและเป็นส่วนตัว</p>
        </div>
      </div>
    </main>
  )
}
