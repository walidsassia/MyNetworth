"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import { Plus, Loader2, Trash2 } from "lucide-react"

interface Budget {
  id: string
  category_id: string
  amount: number
  spent: number
  category?: { id: string; name: string; color: string }
}

interface Category {
  id: string
  name: string
  color: string
  classification: string
}

interface Props {
  budgets: Budget[]
  categories: Category[]
  monthStart: string
}

export function BudgetsClient({ budgets, categories, monthStart }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ category_id: "", amount: "" })

  const availableCategories = categories.filter(
    (c) => !budgets.find((b) => b.category_id === c.id)
  )

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("budgets").insert({
      user_id: user.id,
      category_id: form.category_id,
      amount: parseFloat(form.amount),
      month: monthStart,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setOpen(false)
      setForm({ category_id: "", amount: "" })
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from("budgets").delete().eq("id", id)
    router.refresh()
  }

  const totalBudgeted = budgets.reduce((s, b) => s + Number(b.amount), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Budgeted</p>
          <p className="text-xl font-semibold text-foreground">{formatCurrency(totalBudgeted)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
          <p className={`text-xl font-semibold ${totalSpent > totalBudgeted ? "text-destructive" : "text-foreground"}`}>
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground mb-1">Remaining</p>
          <p className={`text-xl font-semibold ${totalBudgeted - totalSpent < 0 ? "text-destructive" : "text-positive"}`}>
            {formatCurrency(totalBudgeted - totalSpent)}
          </p>
        </div>
      </div>

      {/* Budget list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">This Month</h2>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Budget
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No budgets set for this month.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {budgets.map((budget) => {
              const pct = budget.amount > 0 ? Math.min((budget.spent / Number(budget.amount)) * 100, 100) : 0
              const over = budget.spent > Number(budget.amount)
              return (
                <div key={budget.id} className="bg-card border border-border rounded-xl p-4 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: budget.category?.color || "#6172F3" }}
                      />
                      <span className="text-sm font-medium text-foreground">{budget.category?.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatCurrency(budget.spent)} / {formatCurrency(Number(budget.amount))}
                      </span>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${over ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {over && (
                    <p className="text-xs text-destructive mt-1">
                      Over budget by {formatCurrency(budget.spent - Number(budget.amount))}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add budget modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Add Budget</h2>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {availableCategories.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  All categories have budgets. Add more categories first.
                </p>
                <button onClick={() => setOpen(false)} className="mt-4 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent w-full">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Monthly Budget Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="500.00"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Add
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
