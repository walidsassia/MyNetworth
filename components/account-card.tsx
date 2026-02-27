"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import type { Account } from "@/lib/types"
import { Building2, Pencil, Trash2, Loader2 } from "lucide-react"

const TYPE_ICONS: Record<string, string> = {
  checking: "🏦",
  savings: "💰",
  investment: "📈",
  crypto: "₿",
  real_estate: "🏠",
  vehicle: "🚗",
  loan: "💳",
  credit_card: "💳",
  other_asset: "📦",
  other_liability: "📋",
}

interface Props {
  account: Account
}

export function AccountCard({ account }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(String(account.balance))
  const [name, setName] = useState(account.name)

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from("accounts")
      .update({ name, balance: parseFloat(balance), updated_at: new Date().toISOString() })
      .eq("id", account.id)
    setLoading(false)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from("accounts").delete().eq("id", account.id)
    setLoading(false)
    setDeleting(false)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="bg-card border border-primary/40 rounded-xl p-4">
        <form onSubmit={handleUpdate} className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(false)} className="flex-1 py-1.5 text-xs rounded-lg border border-border text-foreground hover:bg-accent">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1">
              {loading && <Loader2 className="w-3 h-3 animate-spin" />} Save
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (deleting) {
    return (
      <div className="bg-card border border-destructive/40 rounded-xl p-4 flex flex-col gap-3">
        <p className="text-sm text-foreground">Delete <span className="font-medium">{account.name}</span>?</p>
        <div className="flex gap-2">
          <button onClick={() => setDeleting(false)} className="flex-1 py-1.5 text-xs rounded-lg border border-border text-foreground hover:bg-accent">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 py-1.5 text-xs rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center gap-1">
            {loading && <Loader2 className="w-3 h-3 animate-spin" />} Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{TYPE_ICONS[account.type] || "📦"}</span>
          <div>
            <p className="text-sm font-medium text-foreground leading-tight">{account.name}</p>
            {account.institution_name && (
              <p className="text-xs text-muted-foreground">{account.institution_name}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleting(true)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className={`text-xl font-semibold tabular-nums ${account.classification === "liability" ? "text-destructive" : "text-foreground"}`}>
        {formatCurrency(Number(account.balance))}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{account.type.replace(/_/g, " ")}</p>
    </div>
  )
}
