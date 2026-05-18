export type PaymentMode = 'UPI' | 'Cash' | 'Card' | 'Net Banking'
export type IncomeType = 'Salary' | 'Freelance' | 'Rental' | 'Investment Returns' | 'Other'
export type HoldingType = 'FD' | 'SIP' | 'Stocks' | 'PPF' | 'EPF' | 'NPS'

export interface Expense {
  id: string
  date: string
  category: string
  amount: number
  note: string
  payment_mode: PaymentMode
}

export interface Income {
  id: string
  date: string
  type: IncomeType
  amount: number
  note: string
}

export interface Holding {
  id: string
  type: HoldingType
  name: string
  amount: number
  units: string
  buy_price: string
  maturity_date: string
  last_updated: string
}

export interface Account {
  id: string
  bank_name: string
  account_type: string
  balance: number
  last_updated: string
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining','Transportation','Shopping','Utilities','Healthcare',
  'Entertainment','Education','Rent','EMI','Insurance',
  'Investments','Personal Care','Travel','Gifts','Other',
]
