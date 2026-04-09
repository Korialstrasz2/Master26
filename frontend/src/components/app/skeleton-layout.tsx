import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

const VOCI_LATERALI = [
  "Menu",
  "Combat",
  "PG",
  "Negozio",
  "Skill",
  "Lore",
  "Guide",
  "Mappa",
  "Inventario",
  "Quest",
  "Social",
  "Eventi",
];

type SkeletonLayoutProps = {
  utente: string | null;
  sidebarAperta: boolean;
  setSidebarAperta: (aperta: boolean) => void;
  onLogout: () => void;
  children: ReactNode;
};

export function SkeletonLayout({
  utente,
  sidebarAperta,
  setSidebarAperta,
  onLogout,
  children,
}: SkeletonLayoutProps) {
  return (
    <main className="min-h-screen bg-[#17110a] text-amber-100">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-amber-800/60 bg-slate-950/95 px-6 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <nav className="flex items-center gap-2">
            <Button className="bg-amber-700 text-slate-950 hover:bg-amber-500">Dadi</Button>
            <Button className="bg-amber-700 text-slate-950 hover:bg-amber-500">Competenze</Button>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full border border-amber-700/80 px-3 py-1">{utente}</span>
            <Button className="bg-rose-700 text-white hover:bg-rose-600" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <aside
        onMouseEnter={() => setSidebarAperta(true)}
        onMouseLeave={() => setSidebarAperta(false)}
        className={`fixed left-0 top-[49px] z-20 h-[calc(100vh-49px)] border-r border-amber-800/60 bg-slate-950/95 p-2 transition-all duration-300 ${
          sidebarAperta ? "w-56" : "w-14"
        }`}
      >
        <div className="flex h-full flex-col gap-2 overflow-hidden">
          {VOCI_LATERALI.map((voce) => (
            <button
              key={voce}
              className="rounded-md border border-amber-800/80 bg-[#2d2115] px-3 py-2 text-left text-sm font-bold uppercase tracking-wide text-amber-200 hover:bg-amber-700/25"
              type="button"
            >
              {sidebarAperta ? voce : voce.slice(0, 1)}
            </button>
          ))}
        </div>
      </aside>

      <section className={`pt-20 transition-all duration-300 ${sidebarAperta ? "pl-60" : "pl-16"}`}>{children}</section>
    </main>
  );
}
