"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type StatoAutenticazione = "caricamento" | "autenticato" | "anonimo";

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

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [codiceRegistrazione, setCodiceRegistrazione] = useState("");
  const [usernameRegistrazione, setUsernameRegistrazione] = useState("");
  const [passwordRegistrazione, setPasswordRegistrazione] = useState("");
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [stato, setStato] = useState<StatoAutenticazione>("caricamento");
  const [utente, setUtente] = useState<string | null>(null);
  const [sidebarAperta, setSidebarAperta] = useState(true);

  const endpoint = useMemo(
    () => ({
      csrf: `${API_BASE_URL}/auth/csrf/`,
      login: `${API_BASE_URL}/auth/login/`,
      register: `${API_BASE_URL}/auth/register/`,
      logout: `${API_BASE_URL}/auth/logout/`,
      me: `${API_BASE_URL}/auth/me/`,
      dashboard: `${API_BASE_URL}/`,
      admin: `${API_BASE_URL}/admin/`,
    }),
    [],
  );

  useEffect(() => {
    const inizializza = async () => {
      try {
        await fetch(endpoint.csrf, { credentials: "include" });
        const meResponse = await fetch(endpoint.me, { credentials: "include" });

        if (meResponse.ok) {
          const meData = (await meResponse.json()) as { utente: string; ruolo: string };
          setUtente(meData.utente);
          localStorage.setItem("isMaster", String(meData.ruolo === "admin"));
          setStato("autenticato");
          await caricaDashboard();
          return;
        }
      } catch {
        setErrore("Impossibile contattare il backend.");
      }

      setStato("anonimo");
    };

    void inizializza();
  }, [endpoint.csrf, endpoint.me]);

  useEffect(() => {
    if (stato !== "autenticato") {
      return;
    }

    setSidebarAperta(true);
    const timer = window.setTimeout(() => {
      setSidebarAperta(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [stato]);

  const leggiCsrfCookie = () => {
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith("csrftoken="));
    return cookie?.split("=")[1] ?? "";
  };

  const caricaDashboard = async () => {
    const response = await fetch(endpoint.dashboard, { credentials: "include" });

    if (!response.ok) {
      setMessaggio("");
      return;
    }

    const data = (await response.json()) as { messaggio: string };
    setMessaggio(data.messaggio);
  };

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrore("");

    const csrfToken = leggiCsrfCookie();

    const response = await fetch(endpoint.login, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setErrore("Credenziali non valide.");
      return;
    }

    const data = (await response.json()) as { utente: string; ruolo: string };
    setUtente(data.utente);
    localStorage.setItem("isMaster", String(data.ruolo === "admin"));
    setStato("autenticato");
    setPassword("");
    await caricaDashboard();
  };

  const onRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrore("");

    const codiceNumerico = Number(codiceRegistrazione);
    if (!Number.isFinite(codiceNumerico)) {
      setErrore("Inserisci un codice registrazione numerico valido.");
      return;
    }

    const csrfToken = leggiCsrfCookie();
    const response = await fetch(endpoint.register, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        username: usernameRegistrazione,
        password: passwordRegistrazione,
        codice_registrazione: codiceNumerico,
      }),
    });

    const data = (await response.json()) as { dettaglio?: string };
    if (!response.ok) {
      setErrore(data.dettaglio ?? "Registrazione non riuscita.");
      return;
    }

    setErrore("");
    setMessaggio("Registrazione completata. Ora puoi effettuare l'accesso.");
    setUsernameRegistrazione("");
    setPasswordRegistrazione("");
    setCodiceRegistrazione("");
  };

  const onLogout = async () => {
    const csrfToken = leggiCsrfCookie();
    await fetch(endpoint.logout, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });

    setStato("anonimo");
    setUtente(null);
    setMessaggio("");
    setUsername("");
    setPassword("");
    localStorage.removeItem("isMaster");
  };

  if (stato === "caricamento") {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6 text-amber-100">
        <p>Verifica credenziali in corso...</p>
      </main>
    );
  }

  if (stato === "anonimo") {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-8 p-6 text-amber-100">
        <h1 className="text-4xl font-black uppercase tracking-[0.14em] text-amber-300">Portale Master26</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-amber-700/60 bg-slate-950/80 p-5 shadow-xl shadow-amber-900/25">
            <h2 className="mb-4 text-xl font-semibold text-amber-200">Accedi</h2>
            <form onSubmit={onLogin} className="flex flex-col gap-3">
              <input
                className="rounded border border-amber-800 bg-slate-900 p-2"
                placeholder="Username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              <input
                className="rounded border border-amber-800 bg-slate-900 p-2"
                placeholder="Password"
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <Button type="submit">Accedi</Button>
            </form>
          </section>

          <section className="rounded-2xl border border-amber-700/60 bg-slate-950/80 p-5 shadow-xl shadow-amber-900/25">
            <h2 className="mb-4 text-xl font-semibold text-amber-200">Nuovo utente</h2>
            <form onSubmit={onRegister} className="flex flex-col gap-3">
              <input
                className="rounded border border-amber-800 bg-slate-900 p-2"
                placeholder="Username"
                autoComplete="username"
                value={usernameRegistrazione}
                onChange={(event) => setUsernameRegistrazione(event.target.value)}
                required
              />
              <input
                className="rounded border border-amber-800 bg-slate-900 p-2"
                placeholder="Password"
                autoComplete="new-password"
                type="password"
                value={passwordRegistrazione}
                onChange={(event) => setPasswordRegistrazione(event.target.value)}
                required
              />
              <input
                className="rounded border border-amber-800 bg-slate-900 p-2"
                placeholder="Codice registrazione (numero)"
                type="number"
                inputMode="numeric"
                value={codiceRegistrazione}
                onChange={(event) => setCodiceRegistrazione(event.target.value)}
                required
              />
              <Button type="submit">Registra utente</Button>
            </form>
          </section>
        </div>

        {errore ? <p className="text-red-400">{errore}</p> : null}
        {messaggio ? <p className="text-emerald-300">{messaggio}</p> : null}
      </main>
    );
  }

  const isMaster = localStorage.getItem("isMaster") === "true";

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

      <section className={`pt-20 transition-all duration-300 ${sidebarAperta ? "pl-60" : "pl-16"}`}>
        <div className="mx-auto max-w-5xl p-6">
          <h1 className="text-3xl font-black uppercase tracking-[0.12em] text-amber-300">Main Menu</h1>
          <p className="mt-2 text-sm text-amber-100/80">Benvenuto nella skeleton dell'app principale.</p>
          {messaggio ? <p className="mt-2 text-xs text-amber-200/75">{messaggio}</p> : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Button disabled className="h-20 bg-amber-700/90 text-slate-950 hover:bg-amber-600 disabled:opacity-80">
              Seleziona PG
            </Button>
            <Button
              disabled
              className="h-20 bg-amber-700/90 text-slate-950 hover:bg-amber-600 disabled:opacity-80"
            >
              Impostazioni Utente
            </Button>
            {isMaster ? (
              <a
                href={endpoint.admin}
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
      </section>
    </main>
  );
}
