"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type StatoAutenticazione = "caricamento" | "autenticato" | "anonimo";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [stato, setStato] = useState<StatoAutenticazione>("caricamento");
  const [utente, setUtente] = useState<string | null>(null);

  const endpoint = useMemo(
    () => ({
      csrf: `${API_BASE_URL}/auth/csrf/`,
      login: `${API_BASE_URL}/auth/login/`,
      logout: `${API_BASE_URL}/auth/logout/`,
      me: `${API_BASE_URL}/auth/me/`,
      dashboard: `${API_BASE_URL}/`,
    }),
    [],
  );

  useEffect(() => {
    const inizializza = async () => {
      try {
        await fetch(endpoint.csrf, { credentials: "include" });
        const meResponse = await fetch(endpoint.me, { credentials: "include" });

        if (meResponse.ok) {
          const meData = (await meResponse.json()) as { utente: string };
          setUtente(meData.utente);
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

    const data = (await response.json()) as { utente: string };
    setUtente(data.utente);
    setStato("autenticato");
    setPassword("");
    await caricaDashboard();
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
  };

  if (stato === "caricamento") {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
        <p className="text-slate-600">Verifica credenziali in corso...</p>
      </main>
    );
  }

  if (stato === "anonimo") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
        <h1 className="text-3xl font-bold">Accesso richiesto</h1>
        <p className="text-slate-600">
          Per usare il sito devi autenticarti con un account autorizzato.
        </p>

        <form onSubmit={onLogin} className="flex flex-col gap-3">
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Password"
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit">Accedi</Button>
        </form>

        {errore ? <p className="text-red-600">{errore}</p> : null}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">Area protetta</h1>
      <p className="text-lg text-slate-600">Accesso consentito a: {utente}</p>
      {messaggio ? <p className="text-slate-700">{messaggio}</p> : null}
      <Button onClick={onLogout}>Logout</Button>
    </main>
  );
}
