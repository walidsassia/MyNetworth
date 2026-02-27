import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { NetWorthChart } from "@/components/net-worth-chart"
import Link from "next/link"
import type { Account, Transaction, NetWorthHistory } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [accountsRes, recentTxRes, nwhRes] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", user!.id).eq("is_active", true),
    supabase
      .from("transactions")
      .select("*, account:accounts(name), category:categories(name,color)")
      .eq("user_id", user!.id)
      .order("date", { ascending: false })
      .limit(5),
    supabase
      .from("net_worth_history")
      .select("*")
      .eq("user_id", user!.id)
      .order("date", { ascending: true })
      .limit(12),
  ])

  const accounts = (accountsRes.data || []) as Account[]
  const recentTx = recentTxRes.data || []
  const history = (nwhRes.data || []) as NetWorthHistory[]

  const totalAssets = accounts
    .filter((a) => a.classification === "asset")
    .reduce((s, a) => s + Number(a.balance), 0)
  const totalLiabilities = accounts
    .filter((a) => a.classification === "liability")
    .reduce((s, a) => s + Number(a.balance), 0)
  const netWorth = totalAssets - totalLiabilities

  // Month-over-month change
  const prev = history.length >= 2 ? history[history.length - 2].net_worth : null
  const curr = history.length >= 1 ? history[history.length - 1].net_worth : netWorth
  const change = prev !== null ? curr - Number(prev) : null
  const changePct = prev && Number(prev) !== 0 ? (change! / Math.abs(Number(prev))) * 100 : null

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your financial overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Net Worth</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(netWorth)}</p>
          {change !== null && changePct !== null && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${change >= 0 ? "text-positive" : "text-negative"}`}>
              {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {formatCurrency(Math.abs(change))} ({changePct.toFixed(1)}%) this month
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total Assets</span>
            <div className="w-8 h-8 rounded-lg bg-positive/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-positive" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalAssets)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {accounts.filter((a) => a.classification === "asset").length} accounts
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total Liabilities</span>
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalLiabilities)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {accounts.filter((a) => a.classification === "liability").length} accounts
          </p>
        </div>
      </div>

      {/* Net worth chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-foreground mb-4">Net Worth Over Time</h2>
        {history.length > 1 ? (
          <NetWorthChart data={history} />
        ) : (
          <div className="h-48 flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">No history yet.</p>
            <p className="text-xs text-muted-foreground">Add accounts and track your progress over time.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts summary */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Accounts</h2>
            <Link href="/accounts" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {accounts.length === 0 ? (
            <div className="py-8 text-center">
              <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No accounts yet</p>
              <Link href="/accounts" className="text-xs text-primary hover:underline mt-1 inline-block">
                Add your first account
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {accounts.slice(0, 5).map((account) => (
                <div key={account.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${account.classification === "asset" ? "bg-positive" : "bg-destructive"}`} />
                    <div>
                      <p className="text-sm text-foreground">{account.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{account.type.replace("_", " ")}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium tabular-nums ${account.classification === "liability" ? "text-destructive" : "text-foreground"}`}>
                    {formatCurrency(Number(account.balance))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Recent Transactions</h2>
            <Link href="/transactions" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentTx.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentTx.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm text-foreground">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.account?.name} &middot; {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-sm font-medium tabular-nums ${Number(tx.amount) < 0 ? "text-destructive" : "text-positive"}`}>
                    {Number(tx.amount) >= 0 ? "+" : ""}{formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
