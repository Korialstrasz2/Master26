import { Button } from "@/components/ui/button";

type MainMenuProps = {
  isMaster: boolean;
  adminUrl: string;
  messaggio: string;
};

export function MainMenu({ isMaster, adminUrl, messaggio }: MainMenuProps) {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-black uppercase tracking-[0.12em] text-amber-300">Main Menu</h1>
      <p className="mt-2 text-sm text-amber-100/80">Benvenuto nella skeleton dell'app principale.</p>
      {messaggio ? <p className="mt-2 text-xs text-amber-200/75">{messaggio}</p> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Button disabled className="h-20 bg-amber-700/90 text-slate-950 hover:bg-amber-600 disabled:opacity-80">
          Seleziona PG
        </Button>
        <Button disabled className="h-20 bg-amber-700/90 text-slate-950 hover:bg-amber-600 disabled:opacity-80">
          Impostazioni Utente
        </Button>
        {isMaster ? (
          <a
            href={adminUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-20 items-center justify-center rounded-md bg-amber-500 font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Admin
          </a>
        ) : (
          <Button disabled className="h-20 bg-slate-700 text-slate-300 disabled:opacity-70">
            Admin (solo master)
          </Button>
        )}
      </div>
    </div>
  );
}
