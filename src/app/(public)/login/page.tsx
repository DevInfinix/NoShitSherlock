import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-ink text-paper flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="font-mono text-xs text-brass uppercase tracking-widest text-center p-8">
            Accessing Scotland Yard Identity Vault...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
