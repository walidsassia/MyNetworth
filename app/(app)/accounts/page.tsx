import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import type { Account } from "@/lib/types"
import { AddAccountDialog } from "@/components/add-account-dialog"
import { AccountCard } from "@/components/account-card"

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id)
    .order("classification")
    .order("name")

  const accounts = (data || []) as Account[]
  const assets = accounts.filter((a) => a.classification === "asset")
  const liabilities = accounts.filter((a) => a.classification === "liability")
  const totalAssets = assets.reduce((s, a) => s + Number(a.balance), 0)
  const totalLiabilities = liabilities.reduce((s, a) => s + Number(a.balance), 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground text-balance">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your assets and liabilities</p>
        </div>
        <AddAccountDialog />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Net Worth</p>
          <p className="text-xl font-semibold text-foreground">{formatCurrency(totalAssets - totalLiabilities)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Assets</p>
          <p className="text-xl font-semibold text-positive">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground mb-1">Total Liabilities</p>
          <p className="text-xl font-semibold text-destructive">{formatCurrency(totalLiabilities)}</p>
        </div>
      </div>

      {/* Assets */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Assets ({assets.length})
        </h2>
        {assets.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No assets yet. Add your first asset account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assets.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </section>

      {/* Liabilities */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Liabilities ({liabilities.length})
        </h2>
        {liabilities.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No liabilities. Great job!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liabilities.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
