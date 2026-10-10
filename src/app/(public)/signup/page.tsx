import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-ink text-paper w-full">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center font-mono text-xs text-brass uppercase tracking-widest text-center p-8">
            Opening Scotland Yard Roster Protocol...
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </main>
  );
}
