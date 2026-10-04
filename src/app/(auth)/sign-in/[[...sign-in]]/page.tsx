import { SignIn } from "@clerk/nextjs";

/**
 * Sign In Page
 * 
 * Clerk ka dynamic catch-all route `[[...sign-in]]`.
 * Is route se user Google, GitHub, ya email se sign-in karta hai.
 */
export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-grid-pattern relative">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              card: "glass-panel border border-emerald-500/20 shadow-2xl",
              headerTitle: "text-white font-bold text-xl",
              headerSubtitle: "text-muted-foreground text-sm",
              socialButtonsBlockButton: "border border-border bg-secondary/50 hover:bg-secondary text-white",
              formButtonPrimary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium",
            },
          }}
        />
      </div>
    </div>
  );
}
