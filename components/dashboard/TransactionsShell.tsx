'use client'
import TransactionsSection from './TransactionsSection'
export default function TransactionsShell() {
  return <TransactionsSection loading={false} onReload={async () => {}} />
}
