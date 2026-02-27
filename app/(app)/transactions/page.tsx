import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [txRes, accountsRes, categoriesRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, account:accounts(name), category:categories(name,color)")
      .eq("user_id", user!.id)
      .order("date", { ascending: false })
      .limit(100),
    supabase.from("accounts").select("id,name").eq("user_id", user!.id).eq("is_active", true),
    supabase.from("categories").select("*").eq("user_id", user!.id),
  ])

  const transactions = txRes.data || []
  const accounts = accountsRes.data || []
  const categories = categoriesRes.data || []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground text-balance">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your income and expenses</p>
        </div>
        <AddTransactionDialog accounts={accounts} categories={categories} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet. Add your first one.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden sm:table-cell">Account</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Category</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">{tx.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell">{tx.account?.name}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    {tx.category ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: `${tx.category.color}20`, color: tx.category.color }}
                      >
                        {tx.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className={`px-5 py-3 text-sm font-medium text-right tabular-nums ${Number(tx.amount) < 0 ? "text-destructive" : "text-positive"}`}>
                    {Number(tx.amount) >= 0 ? "+" : ""}{formatCurrency(Number(tx.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
