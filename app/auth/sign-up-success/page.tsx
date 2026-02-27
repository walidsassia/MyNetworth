import Link from "next/link"
import { TrendingUp, MailCheck } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">MyNetworth</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-1">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent you a confirmation link. Click it to activate your account and start tracking your net worth.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:underline font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
