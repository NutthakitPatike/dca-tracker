import FinanceShell from '@/components/finance/FinanceShell'

export default function FinancePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-panel">
          <h1 className="text-3xl font-semibold text-slate-950">ระบบรายรับ-รายจ่าย</h1>
          <p className="mt-3 text-slate-600">จัดการบันทึกรายรับและรายจ่ายแยกต่างหากจากระบบลงทุน DCA.</p>
        </div>

        <FinanceShell />
      </div>
    </main>
  )
}
