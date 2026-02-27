export type AccountType =
  | "checking"
  | "savings"
  | "investment"
  | "crypto"
  | "real_estate"
  | "vehicle"
  | "loan"
  | "credit_card"
  | "other_liability"
  | "other_asset"

export type AccountClassification = "asset" | "liability"

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  classification: AccountClassification
  balance: number
  currency: string
  institution_name: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  classification: "income" | "expense"
  parent_id: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  name: string
  amount: number
  currency: string
  date: string
  notes: string | null
  excluded: boolean
  created_at: string
  updated_at: string
  account?: Account
  category?: Category
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  currency: string
  month: string
  created_at: string
  updated_at: string
  category?: Category
  spent?: number
}

export interface NetWorthHistory {
  id: string
  user_id: string
  date: string
  assets: number
  liabilities: number
  net_worth: number
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  currency: string
  created_at: string
  updated_at: string
}
