import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-ink text-paper w-full">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center font-mono text-xs text-brass uppercase tracking-widest text-center p-8">
            Accessing Scotland Yard Identity Vault...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
