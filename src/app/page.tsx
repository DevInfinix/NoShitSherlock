export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl space-y-6 border border-[var(--color-brass)] bg-[var(--color-ink-raised)] p-12 shadow-2xl">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-paper-muted)]">
          Case Archives &bull; Evidence Unit
        </p>
        <h1 className="text-5xl font-serif tracking-tight text-[var(--color-paper)]">
          NoShitSherlock
        </h1>
        <p className="text-sm leading-relaxed text-[var(--color-paper-muted)]">
          M0 Foundation initialized. Awaiting case dossier and investigation deployment.
        </p>
        <div className="pt-4">
          <span className="inline-block border border-[var(--color-evidence-red)] px-4 py-1 text-xs font-mono uppercase text-[var(--color-evidence-red)]">
            System Operational
          </span>
        </div>
      </div>
    </main>
  );
}
