export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id: string
  type: TransactionType
  amount: string
  category: string
  note?: string
  date: string
  createdAt: string
}

export interface Portfolio {
  id: string
  name: string
  symbol: string
  currentPrice: string
  createdAt: string
}

export interface Trade {
  id: string
  portfolioId: string
  quantity: string
  price: string
  amount: string
  date: string
  createdAt: string
}

export interface DashboardMetrics {
  totalIncome: number
  totalExpense: number
  netBalance: number
  portfolioValue: number
}
