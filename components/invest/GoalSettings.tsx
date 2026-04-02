'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/metrics'
import { useGoals } from '@/hooks/useGoals'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function GoalSettings() {
  const { goals, loading, addGoal, updateGoal, deleteGoal, calculateGoalProgress } = useGoals()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: 0,
    deadline: '',
    category: 'RETIREMENT' as const
  })
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addGoal({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        currentAmount: formData.currentAmount,
        deadline: formData.deadline,
        category: formData.category
      })
      setFormData({ name: '', targetAmount: '', currentAmount: 0, deadline: '', category: 'RETIREMENT' })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to add goal:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id)
      setDeletingId(null)
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  const categoryLabels = {
    RETIREMENT: 'เกษียณ',
    HOUSE: 'ซื้อบ้าน',
    EDUCATION: 'การศึกษา',
    TRAVEL: 'ท่องเที่ยว',
    OTHER: 'อื่นๆ'
  }

  const categoryColors = {
    RETIREMENT: 'var(--accent)',
    HOUSE: 'var(--green)',
    EDUCATION: 'var(--amber)',
    TRAVEL: 'var(--red)',
    OTHER: 'var(--muted)'
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>เป้าหมายการลงทุน</h3>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '6px 12px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          + เพิ่มเป้าหมาย
        </button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>ยังไม่มีเป้าหมายการลงทุน</p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            ตั้งเป้าหมายแรก
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {goals.map(goal => {
            const progress = calculateGoalProgress(goal)
            return (
              <div key={goal.id} style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{goal.name}</h4>
                    <span style={{ fontSize: 11, color: categoryColors[goal.category], background: `${categoryColors[goal.category]}22`, padding: '2px 6px', borderRadius: 3 }}>
                      {categoryLabels[goal.category]}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeletingId(goal.id)}
                    style={{
                      padding: '4px 8px',
                      background: 'none',
                      border: '1px solid var(--red)',
                      color: 'var(--red)',
                      borderRadius: 'var(--radius)',
                      fontSize: 10,
                      cursor: 'pointer'
                    }}
                  >
                    ลบ
                  </button>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                    <span>{progress.percentage.toFixed(1)}%</span>
                    <span>{formatMoney(goal.currentAmount, 'USD')} / {formatMoney(goal.targetAmount, 'USD')}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: progress.onTrack ? 'var(--green)' : 'var(--amber)',
                        borderRadius: 4,
                        width: `${Math.min(progress.percentage, 100)}%`,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 10, color: 'var(--text2)' }}>
                  <div>
                    <span style={{ color: 'var(--muted)' }}>คงเหลือ: </span>
                    {formatMoney(progress.remaining, 'USD')}
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)' }}>ต่อเดือน: </span>
                    {formatMoney(progress.monthlyRequired, 'USD')}
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)' }}>เหลือ: </span>
                    {progress.daysLeft} วัน
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Goal Form */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 24, borderRadius: 'var(--radius)', width: '400px', maxWidth: '90vw' }}>
            <h3 style={{ margin: 0, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>เพิ่มเป้าหมายการลงทุน</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>ชื่อเป้าหมาย</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)',
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>จำนวนเงินเป้าหมาย (USD)</label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)',
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>วันครบกำหนด</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)',
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>หมวดหมู่</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)',
                    fontSize: 13
                  }}
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingId}
        title="ลบเป้าหมาย?"
        message="คุณต้องการลบเป้าหมายนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="ลบ"
        onConfirm={() => deletingId && handleDelete(deletingId)}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
