import { formatMoney } from './metrics'
import type { Portfolio, Trade } from '@/types/finance'

// Extended Transaction interface for export
interface ExportTransaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: string | number
  category: string
  note?: string
  date: string
  createdAt?: string
}

// CSV Export Functions
export function exportPortfolioToCSV(portfolios: Portfolio[], trades: Trade[], exchangeRate: number) {
  const headers = ['Symbol', 'Name', 'Quantity', 'Average Cost (USD)', 'Current Price (USD)', 'Total Cost (USD)', 'Current Value (USD)', 'P&L (USD)', 'P&L (THB)', 'Return (%)']
  
  const rows = portfolios.map(portfolio => {
    const portfolioTrades = trades.filter(t => t.portfolioId === portfolio.id)
    const totalQuantity = portfolioTrades.reduce((sum, t) => sum + Number(t.quantity), 0)
    const totalCost = portfolioTrades.reduce((sum, t) => sum + Number(t.quantity) * Number(t.price), 0)
    const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0
    const currentPrice = Number(portfolio.currentPrice)
    const currentValue = currentPrice * totalQuantity
    const pnl = currentValue - totalCost
    const pnlTHB = pnl * exchangeRate
    const returnPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0

    return [
      portfolio.symbol,
      portfolio.name,
      totalQuantity.toFixed(3),
      formatMoney(averageCost, 'USD'),
      formatMoney(currentPrice, 'USD'),
      formatMoney(totalCost, 'USD'),
      formatMoney(currentValue, 'USD'),
      formatMoney(pnl, 'USD'),
      formatMoney(pnlTHB, 'THB'),
      `${returnPct.toFixed(2)}%`
    ]
  })

  return createCSV(headers, rows)
}

export function exportTradesToCSV(trades: Trade[], portfolios: Portfolio[], exchangeRate: number) {
  const headers = ['Date', 'Symbol', 'Type', 'Quantity', 'Price (USD)', 'Amount (USD)', 'Amount (THB)']
  
  const rows = trades.map(trade => {
    const portfolio = portfolios.find(p => p.id === trade.portfolioId)
    const amountUSD = Number(trade.quantity) * Number(trade.price)
    const amountTHB = amountUSD * exchangeRate

    return [
      new Date(trade.date).toLocaleDateString('th-TH'),
      portfolio?.symbol || 'Unknown',
      'BUY',
      Number(trade.quantity).toFixed(3),
      formatMoney(Number(trade.price), 'USD'),
      formatMoney(amountUSD, 'USD'),
      formatMoney(amountTHB, 'THB')
    ]
  })

  return createCSV(headers, rows)
}

export function exportTransactionsToCSV(transactions: ExportTransaction[], exchangeRate: number) {
  const headers = ['Date', 'Category', 'Note', 'Type', 'Amount (THB)', 'Amount (USD)']
  
  const rows = transactions.map(tx => {
    const amountTHB = Number(tx.amount)
    const amountUSD = tx.type === 'INCOME' ? amountTHB / exchangeRate : -(amountTHB / exchangeRate)

    return [
      new Date(tx.date).toLocaleDateString('th-TH'),
      tx.category,
      tx.note || '',
      tx.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย',
      formatMoney(amountTHB, 'THB'),
      formatMoney(amountUSD, 'USD')
    ]
  })

  return createCSV(headers, rows)
}

export function exportFinanceSummaryToCSV(transactions: ExportTransaction[], exchangeRate: number) {
  const incomeCategories = ['เงินเดือน', 'โบนัส', 'ดอกเบี้ย', 'อื่นๆ']
  const expenseCategories = ['อาหาร', 'เดินทาง', 'ที่พัก', 'สาธารณูปโภค', 'บันเทิง', 'อื่นๆ']

  const incomeByCategory = incomeCategories.map(cat => {
    const total = transactions
      .filter(t => t.type === 'INCOME' && t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    return [cat, formatMoney(total, 'THB'), formatMoney(total / exchangeRate, 'USD')]
  })

  const expenseByCategory = expenseCategories.map(cat => {
    const total = transactions
      .filter(t => t.type === 'EXPENSE' && t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    return [cat, formatMoney(total, 'THB'), formatMoney(total / exchangeRate, 'USD')]
  })

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const summary = [
    ['รายรับรวม', formatMoney(totalIncome, 'THB'), formatMoney(totalIncome / exchangeRate, 'USD')],
    ['รายจ่ายรวม', formatMoney(totalExpense, 'THB'), formatMoney(totalExpense / exchangeRate, 'USD')],
    ['ยอดคงเหลือ', formatMoney(totalIncome - totalExpense, 'THB'), formatMoney((totalIncome - totalExpense) / exchangeRate, 'USD')]
  ]

  return createCSV(['หมวดหมู่', 'จำนวนเงิน (THB)', 'จำนวนเงิน (USD)'], [
    ['=== รายรับ ==='],
    ...incomeByCategory,
    ['=== รายจ่าย ==='],
    ...expenseByCategory,
    ['=== สรุป ==='],
    ...summary
  ])
}

// Helper function to create CSV
function createCSV(headers: string[], rows: string[][]): string {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return '\ufeff' + csvContent // Add BOM for UTF-8
}

// Download function
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
