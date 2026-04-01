import { z } from 'zod'

const parseNumber = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value)
  }
  return value
}, z.number().finite())

const parseDateString = z.preprocess((value) => {
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? undefined : value
  }
  return undefined
}, z.string())

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: parseNumber.refine((value) => value > 0, { message: 'Amount must be greater than 0' }),
  category: z.string().min(1, 'Category is required'),
  note: z.string().optional(),
  date: parseDateString,
})

export const transactionUpdateSchema = transactionSchema.partial()

export const portfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  currentPrice: parseNumber.refine((value) => value >= 0, { message: 'Price must be a non-negative number' }),
})

export const portfolioUpdateSchema = portfolioSchema.partial()

export const tradeSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio is required'),
  quantity: parseNumber.refine((value) => value > 0, { message: 'Quantity must be greater than 0' }),
  price: parseNumber.refine((value) => value > 0, { message: 'Price must be greater than 0' }),
  date: parseDateString,
})

export const tradeUpdateSchema = tradeSchema.omit({ portfolioId: true }).partial()

export const signUpSchema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
})

export const signInSchema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(1, 'Password is required'),
})

export function formatValidationError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((item) => item.message).join(', ')
  }
  return 'Invalid request'
}
