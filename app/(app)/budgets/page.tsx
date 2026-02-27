import { createClient } from "@/lib/supabase/server"
import { BudgetsClient } from "@/components/budgets-client"

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

  const [budgetsRes, categoriesRes, txRes] = await Promise.all([
    supabase
      .from("budgets")
      .select("*, category:categories(id,name,color)")
      .eq("user_id", user!.id)
      .gte("month", monthStart)
      .lte("month", monthEnd),
    supabase.from("categories").select("*").eq("user_id", user!.id),
    supabase
      .from("transactions")
      .select("category_id, amount")
      .eq("user_id", user!.id)
      .gte("date", monthStart)
      .lte("date", monthEnd)
      .eq("excluded", false),
  ])

  const budgets = budgetsRes.data || []
  const categories = categoriesRes.data || []
  const transactions = txRes.data || []

  // Calculate spending per category
  const spendingByCategory: Record<string, number> = {}
  for (const tx of transactions) {
    if (tx.category_id) {
      spendingByCategory[tx.category_id] = (spendingByCategory[tx.category_id] || 0) + Math.abs(Number(tx.amount))
    }
  }

  const budgetsWithSpent = budgets.map((b: any) => ({
    ...b,
    spent: spendingByCategory[b.category_id] || 0,
  }))

  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground text-balance">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">{monthLabel}</p>
        </div>
      </div>

      <BudgetsClient
        budgets={budgetsWithSpent}
        categories={categories}
        monthStart={monthStart}
      />
    </div>
  )
}
