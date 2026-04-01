import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-panel">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">DCAport</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                ระบบการเงินส่วนบุคคล
              </h1>
              <p className="mt-4 max-w-2xl text-slate-600">
                เลือกโหมดระหว่างระบบรายรับ-รายจ่ายหรือระบบลงทุน DCA และเริ่มจัดการงบการเงินของคุณได้ทันที.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 rounded-3xl bg-white p-2 shadow-sm">
                <Link
                  href="/finance"
                  className="flex-1 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Dashboard รายรับ-รายจ่าย
                </Link>
                <Link
                  href="/invest"
                  className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Dashboard DCA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
