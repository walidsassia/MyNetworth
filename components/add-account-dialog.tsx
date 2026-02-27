"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus } from "lucide-react"
import type { AccountType } from "@/lib/types"

const ACCOUNT_TYPES: { value: AccountType; label: string; classification: "asset" | "liability" }[] = [
  { value: "checking", label: "Checking", classification: "asset" },
  { value: "savings", label: "Savings", classification: "asset" },
  { value: "investment", label: "Investment", classification: "asset" },
  { value: "crypto", label: "Crypto", classification: "asset" },
  { value: "real_estate", label: "Real Estate", classification: "asset" },
  { value: "vehicle", label: "Vehicle", classification: "asset" },
  { value: "other_asset", label: "Other Asset", classification: "asset" },
  { value: "loan", label: "Loan", classification: "liability" },
  { value: "credit_card", label: "Credit Card", classification: "liability" },
  { value: "other_liability", label: "Other Liability", classification: "liability" },
]

export function AddAccountDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    type: "checking" as AccountType,
    balance: "",
    institution_name: "",
    currency: "USD",
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("accounts").insert({
      user_id: user.id,
      name: form.name,
      type: form.type,
      balance: parseFloat(form.balance) || 0,
      institution_name: form.institution_name || null,
      currency: form.currency,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setOpen(false)
      setForm({ name: "", type: "checking", balance: "", institution_name: "", currency: "USD" })
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Account
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Add Account</h2>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Account Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Chase Checking"
              required
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Type</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <optgroup label="Assets">
                {ACCOUNT_TYPES.filter((t) => t.classification === "asset").map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
              <optgroup label="Liabilities">
                {ACCOUNT_TYPES.filter((t) => t.classification === "liability").map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Balance</label>
              <input
                type="number"
                step="0.01"
                value={form.balance}
                onChange={(e) => set("balance", e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>CAD</option>
                <option>AUD</option>
                <option>JPY</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Institution (optional)</label>
            <input
              value={form.institution_name}
              onChange={(e) => set("institution_name", e.target.value)}
              placeholder="e.g. Chase, Fidelity"
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
