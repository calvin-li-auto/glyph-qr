import { useEffect, type ReactNode } from "react";
import { setupServiceWorker } from "@/lib/pwa";

export function GlyphShell({ children, headerStart }: { children: ReactNode; headerStart?: ReactNode }) {
  useEffect(() => { void setupServiceWorker(); }, []);
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6">
      <header className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="justify-self-start">{headerStart}</div>
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="" width={32} height={32} className="rounded-md" />
          <h1 className="text-xl font-bold tracking-tight">Glyph</h1>
        </div>
        <span className="justify-self-end whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">works offline</span>
      </header>
      {children}
    </main>
  );
}
