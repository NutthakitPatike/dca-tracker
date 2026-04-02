'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Area, AreaChart } from 'recharts'
import { formatMoney } from '@/lib/metrics'
import { exportTransactionsToCSV, exportFinanceSummaryToCSV, downloadCSV } from '@/lib/export'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ExportButton from '@/components/ui/ExportButton'
import { SkeletonMetrics, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton'

interface Transaction { id: string; type: 'INCOME' | 'EXPENSE'; amount: string; category: string; note?: string; date: string; createdAt: string }
interface PagedResult { items: Transaction[]; total: number; page: number; pageSize: number; totalPages: number }

const incomeCategories = ['เงินเดือน', 'โบนัส', 'ดอกเบี้ย', 'อื่นๆ']
const expenseCategories = ['อาหาร', 'เดินทาง', 'ที่พัก', 'สาธารณูปโภค', 'บันเทิง', 'อื่นๆ']

const inp: React.CSSProperties = { background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%' }
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', display: 'block', marginBottom: 6 }

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px 24px' }}>
      <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>{label}</p>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 6, color: color ?? 'var(--text)' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px 14px', fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
      <p style={{ color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {formatMoney(p.value)}</p>)}
    </div>
  )
}

export default function FinanceDashboard() {
  const { rate } = useExchangeRate()
  const [data, setData] = useState<PagedResult>({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [fetching, setFetching] = useState(true)
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(incomeCategories[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const fetchPage = useCallback(async (p: number) => {
    setFetching(true)
    try {
      const res = await fetch(`/api/transactions?page=${p}&pageSize=20`)
      if (res.ok) { setData(await res.json()); setPage(p) }
    } finally { setFetching(false) }
  }, [])

  useEffect(() => { fetchPage(1) }, [fetchPage])

  // Export functions
  const handleExportTransactions = async () => {
    setIsExporting(true)
    try {
      const csv = exportTransactionsToCSV(allTx, rate)
      const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSummary = async () => {
    setIsExporting(true)
    try {
      const csv = exportFinanceSummaryToCSV(allTx, rate)
      const filename = `finance_summary_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const allItems = data.items

  // Totals from current page — for overview we fetch more
  const [allTx, setAllTx] = useState<Transaction[]>([])
  useEffect(() => {
    fetch('/api/transactions?page=1&pageSize=500').then(r => r.json()).then(d => setAllTx(d.items ?? []))
  }, [data])

  const totalIncome  = useMemo(() => allTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0), [allTx])
  const totalExpense = useMemo(() => allTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0), [allTx])
  const netBalance   = totalIncome - totalExpense
  const savingRate   = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0'

  // Chart: monthly
  const chartData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expense: number }> = {}
    allTx.forEach((tx) => {
      const d = new Date(tx.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })
      if (!months[key]) months[key] = { month: label, income: 0, expense: 0 }
      if (tx.type === 'INCOME') months[key].income += Number(tx.amount)
      else months[key].expense += Number(tx.amount)
    })
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v).slice(-8)
  }, [allTx])

  // Category breakdown
  const catData = useMemo(() => {
    const cats: Record<string, number> = {}
    allTx.filter(t => t.type === 'EXPENSE').forEach(t => { cats[t.category] = (cats[t.category] ?? 0) + Number(t.amount) })
    return Object.entries(cats).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }))
  }, [allTx])

  // Income categories breakdown
  const incomeCatData = useMemo(() => {
    const cats: Record<string, number> = {}
    allTx.filter(t => t.type === 'INCOME').forEach(t => { cats[t.category] = (cats[t.category] ?? 0) + Number(t.amount) })
    return Object.entries(cats).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }))
  }, [allTx])

  // Colors for each category
  const getCategoryColor = (category: string, type: 'INCOME' | 'EXPENSE') => {
    const incomeColors: Record<string, string> = {
      'เงินเดือน': '#0084C7',
      'โบนัส': '#1a8a5c', 
      'ดอกเบี้ย': '#b8860b',
      'อื่นๆ': '#555555'
    }
    const expenseColors: Record<string, string> = {
      'อาหาร': '#c43333',
      'เดินทาง': '#0084C7',
      'ที่พัก': '#1a8a5c',
      'สาธารณูปโภค': '#b8860b',
      'บันเทิง': '#c43333',
      'อื่นๆ': '#555555'
    }
    return type === 'INCOME' ? (incomeColors[category] || '#888888') : (expenseColors[category] || '#888888')
  }

  // Filter state
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [filterCategory, setFilterCategory] = useState('')

  // Filtered data for table
  const filteredItems = useMemo(() => {
    let filtered = allItems
    if (filterType !== 'ALL') {
      filtered = filtered.filter(t => t.type === filterType)
    }
    if (filterCategory) {
      filtered = filtered.filter(t => t.category === filterCategory)
    }
    return filtered
  }, [allItems, filterType, filterCategory])

  // Get all categories for filter dropdown
  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    allTx.forEach(t => cats.add(t.category))
    return Array.from(cats).sort()
  }, [allTx])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null)
    try {
      const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, amount: Number(amount), category, note, date }) })
      if (!res.ok) throw new Error((await res.json()).error)
      setAmount(''); setNote(''); setType('INCOME'); setCategory(incomeCategories[0])
      await fetchPage(1)
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [editSaving, setEditSaving] = useState(false)

  const startEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setEditAmount(String(tx.amount))
    setEditCategory(tx.category)
    setEditNote(tx.note ?? '')
    setEditDate(new Date(tx.date).toISOString().slice(0, 10))
    setEditType(tx.type)
  }

  const handleEdit = async () => {
    if (!editingTx) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/transactions/${editingTx.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: editType, amount: Number(editAmount), category: editCategory, note: editNote, date: editDate }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setEditingTx(null)
      await fetchPage(page)
    } catch { /* silently fail */ }
    finally { setEditSaving(false) }
  }

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null)
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    await fetchPage(page)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.6px' }}>Finance Dashboard</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <ExportButton 
              onExport={handleExportTransactions} 
              filename="Transactions" 
              isLoading={isExporting}
            />
            <ExportButton 
              onExport={handleExportSummary} 
              filename="Summary" 
              isLoading={isExporting}
            />
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>ภาพรวมรายรับ-รายจ่ายและกระแสเงินสด</p>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="ลบรายการ?"
        message="คุณต้องการลบรายการนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="ลบ"
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* Edit dialog */}
      {editingTx && (
        <div className="confirm-overlay" onClick={() => setEditingTx(null)}>
          <div className="confirm-dialog" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>แก้ไขรายการ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={lbl}>ประเภท</label>
                  <select style={inp} value={editType} onChange={(e) => { const t = e.target.value as 'INCOME'|'EXPENSE'; setEditType(t); setEditCategory(t === 'INCOME' ? incomeCategories[0] : expenseCategories[0]) }}>
                    <option value="INCOME">รายรับ</option><option value="EXPENSE">รายจ่าย</option>
                  </select>
                </div>
                <div><label style={lbl}>จำนวนเงิน</label><input style={inp} type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={lbl}>หมวดหมู่</label>
                  <select style={inp} value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                    {(editType === 'INCOME' ? incomeCategories : expenseCategories).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>วันที่</label><input style={inp} type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required /></div>
              </div>
              <div><label style={lbl}>หมายเหตุ</label><input style={inp} value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="ระบุรายละเอียด…" /></div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setEditingTx(null)} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, background: 'var(--bg)', color: 'var(--text2)', border: '1px solid var(--border)', cursor: 'pointer' }}>ยกเลิก</button>
                <button onClick={handleEdit} disabled={editSaving} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: editSaving ? 0.5 : 1 }}>
                  {editSaving ? 'บันทึก…' : 'บันทึก'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <Metric label="รายรับรวม" value={formatMoney(totalIncome)} color="var(--green)" sub={`${allTx.filter(t => t.type === 'INCOME').length} รายการ`} />
        <Metric label="รายจ่ายรวม" value={formatMoney(totalExpense)} color="var(--red)" sub={`${allTx.filter(t => t.type === 'EXPENSE').length} รายการ`} />
        <Metric label="ยอดคงเหลือ" value={formatMoney(netBalance)} color={netBalance >= 0 ? 'var(--green)' : 'var(--red)'} />
        <Metric label="Saving Rate" value={`${savingRate}%`} color={Number(savingRate) >= 20 ? 'var(--green)' : 'var(--amber)'} sub="รายรับที่เหลือออม" />
      </div>

      {/* Charts row */}
      <div className="grid-main" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Line chart */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>รายรับ vs รายจ่าย รายเดือน</p>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 2, background: 'var(--green)', display: 'inline-block' }} />รายรับ</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 2, background: 'var(--red)', display: 'inline-block' }} />รายจ่าย</span>
            </div>
          </div>
          <div style={{ height: 220 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--red)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--red)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="income" stroke="var(--green)" strokeWidth={3} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="var(--red)" strokeWidth={3} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>ยังไม่มีข้อมูล</div>
            )}
          </div>
        </div>

        {/* Category charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Income categories */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>รายรับตามหมวด</p>
            <div style={{ height: 100 }}>
              {incomeCatData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeCatData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {incomeCatData.map((entry) => <Cell key={entry.name} fill={getCategoryColor(entry.name, 'INCOME')} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>ยังไม่มีข้อมูล</div>
              )}
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {incomeCatData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                  <span style={{ width: 8, height: 2, background: getCategoryColor(item.name, 'INCOME') }} />
                  <span style={{ color: 'var(--text2)' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Expense categories */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>รายจ่ายตามหมวด</p>
            <div style={{ height: 100 }}>
              {catData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={catData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {catData.map((entry) => <Cell key={entry.name} fill={getCategoryColor(entry.name, 'EXPENSE')} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>ยังไม่มีข้อมูล</div>
              )}
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {catData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                  <span style={{ width: 8, height: 2, background: getCategoryColor(item.name, 'EXPENSE') }} />
                  <span style={{ color: 'var(--text2)' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add form + table */}
      <div className="grid-finance" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16 }}>
        {/* Form */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24, alignSelf: 'start' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>เพิ่มรายการใหม่</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={lbl}>ประเภท</label>
                <select style={inp} value={type} onChange={(e) => { const t = e.target.value as 'INCOME'|'EXPENSE'; setType(t); setCategory(t === 'INCOME' ? incomeCategories[0] : expenseCategories[0]) }}>
                  <option value="INCOME">รายรับ</option><option value="EXPENSE">รายจ่าย</option>
                </select>
              </div>
              <div><label style={lbl}>จำนวนเงิน</label><input style={inp} type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={lbl}>หมวดหมู่</label>
                <select style={inp} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {(type === 'INCOME' ? incomeCategories : expenseCategories).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>วันที่</label><input style={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            </div>
            <div><label style={lbl}>หมายเหตุ</label><input style={inp} placeholder="ระบุรายละเอียด…" value={note} onChange={(e) => setNote(e.target.value)} /></div>
            {err && <p style={{ fontSize: 12, color: 'var(--red)' }}>{err}</p>}
            <button type="submit" disabled={saving} style={{ padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', opacity: saving ? 0.5 : 1 }}>
              {saving ? 'กำลังบันทึก…' : 'เพิ่มรายการ'}
            </button>
          </form>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>ประวัติรายการ</p>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>
            {filterType !== 'ALL' || filterCategory ? `${filteredItems.length} / ${data.total}` : data.total} รายการ
          </span>
          </div>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>ประเภท:</label>
              <select 
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 8px', fontSize: 11, color: 'var(--text)' }}
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE')}
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="INCOME">รายรับ</option>
                <option value="EXPENSE">รายจ่าย</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>หมวด:</label>
              <select 
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 8px', fontSize: 11, color: 'var(--text)' }}
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">ทั้งหมด</option>
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {(filterType !== 'ALL' || filterCategory) && (
              <button 
                style={{ padding: '4px 8px', fontSize: 11, background: 'none', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer' }}
                onClick={() => { setFilterType('ALL'); setFilterCategory('') }}
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                  {['วันที่', 'หมวด', 'หมายเหตุ', 'ประเภท', 'จำนวน', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)', padding: '0 10px 10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.querySelectorAll('td').forEach(td => { td.style.background = 'rgba(255,255,255,0.015)' })}
                    onMouseLeave={(e) => e.currentTarget.querySelectorAll('td').forEach(td => { td.style.background = '' })}
                  >
                    <td style={{ padding: '10px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>{new Date(tx.date).toLocaleDateString('th-TH')}</td>
                    <td style={{ padding: '10px', color: 'var(--text2)' }}>{tx.category}</td>
                    <td style={{ padding: '10px', color: 'var(--muted)', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.note || '—'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: tx.type === 'INCOME' ? 'var(--green2)' : 'var(--red2)', color: tx.type === 'INCOME' ? 'var(--green)' : 'var(--red)' }}>
                        {tx.type === 'INCOME' ? 'IN' : 'OUT'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: tx.type === 'INCOME' ? 'var(--green)' : 'var(--red)' }}>
                      {tx.type === 'INCOME' ? '+' : '−'}{formatMoney(Number(tx.amount))}
                    </td>
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => startEdit(tx)} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, cursor: 'pointer', background: 'none', color: 'var(--accent)', border: '1px solid var(--accent)', marginRight: 6 }}>แก้ไข</button>
                      <button onClick={() => setConfirmDeleteId(tx.id)} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, cursor: 'pointer', background: 'none', color: 'var(--red)', border: '1px solid var(--red)' }}>ลบ</button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && !fetching && (
                  <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
                    {filterType !== 'ALL' || filterCategory ? 'ไม่พบรายการที่ตรงกับตัวกรอง' : 'ยังไม่มีรายการ'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button disabled={page <= 1} onClick={() => fetchPage(page - 1)} style={{ padding: '6px 14px', fontSize: 12, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text2)', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>← ก่อนหน้า</button>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: 'var(--muted)' }}>หน้า {page} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages} onClick={() => fetchPage(page + 1)} style={{ padding: '6px 14px', fontSize: 12, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text2)', cursor: page >= data.totalPages ? 'not-allowed' : 'pointer', opacity: page >= data.totalPages ? 0.4 : 1 }}>ถัดไป →</button>
            </div>
          )}
          {fetching && <p style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>⟳ กำลังโหลด…</p>}
        </div>
      </div>
    </div>
  )
}
