import { streamText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const { messages } = await req.json()

  // Fetch user's financial context
  const [accountsRes, txRes] = await Promise.all([
    supabase.from("accounts").select("name,type,classification,balance,currency").eq("user_id", user.id).eq("is_active", true),
    supabase.from("transactions").select("name,amount,date,currency").eq("user_id", user.id).order("date", { ascending: false }).limit(20),
  ])

  const accounts = accountsRes.data || []
  const transactions = txRes.data || []
  const totalAssets = accounts.filter((a: any) => a.classification === "asset").reduce((s: number, a: any) => s + Number(a.balance), 0)
  const totalLiabilities = accounts.filter((a: any) => a.classification === "liability").reduce((s: number, a: any) => s + Number(a.balance), 0)
  const netWorth = totalAssets - totalLiabilities

  const systemPrompt = `You are a knowledgeable personal finance assistant for MyNetworth, a net worth tracking app.

The user's current financial snapshot:
- Net Worth: $${netWorth.toFixed(2)}
- Total Assets: $${totalAssets.toFixed(2)}
- Total Liabilities: $${totalLiabilities.toFixed(2)}
- Accounts (${accounts.length}): ${accounts.map((a: any) => `${a.name} (${a.type}): $${Number(a.balance).toFixed(2)}`).join(", ")}
- Recent transactions (last 20): ${transactions.map((t: any) => `${t.name}: $${Number(t.amount).toFixed(2)} on ${t.date}`).join(", ")}

Be helpful, concise, and actionable. Provide practical financial advice tailored to their situation. Format numbers as currency when relevant.`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages,
  })

  return result.toDataStreamResponse()
}
