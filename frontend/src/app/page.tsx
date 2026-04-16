"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const ottieniApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }

  return "http://127.0.0.1:8000";
};

type StatoAutenticazione = "caricamento" | "anonimo";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [codiceRegistrazione, setCodiceRegistrazione] = useState("");
  const [usernameRegistrazione, setUsernameRegistrazione] = useState("");
  const [passwordRegistrazione, setPasswordRegistrazione] = useState("");
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [stato, setStato] = useState<StatoAutenticazione>("caricamento");

  const endpoint = useMemo(
    () => ({
      csrf: `${ottieniApiBaseUrl()}/auth/csrf/`,
      login: `${ottieniApiBaseUrl()}/auth/login/`,
      register: `${ottieniApiBaseUrl()}/auth/register/`,
      me: `${ottieniApiBaseUrl()}/auth/me/`,
    }),
    [],
  );

  useEffect(() => {
    const inizializza = async () => {
      try {
        await fetch(endpoint.csrf, { credentials: "include" });
        const meResponse = await fetch(endpoint.me, { credentials: "include" });

        if (meResponse.ok) {
          const meData = (await meResponse.json()) as { ruolo: string };
          localStorage.setItem("isMaster", String(meData.ruolo === "admin"));
          router.replace("/main-menu");
          return;
        }
      } catch {
        setErrore("Impossibile contattare il backend.");
      }

      setStato("anonimo");
    };

    void inizializza();
  }, [endpoint.csrf, endpoint.me, router]);

  const leggiCsrfCookie = () => {
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith("csrftoken="));
    return cookie?.split("=")[1] ?? "";
  };

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrore("");
    setMessaggio("");

    try {
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

      const meResponse = await fetch(endpoint.me, { credentials: "include" });
      if (!meResponse.ok) {
        setErrore("Login riuscito ma sessione non valida. Controlla CORS/cookie del backend.");
        return;
      }

      const meData = (await meResponse.json()) as { ruolo: string };
      localStorage.setItem("isMaster", String(meData.ruolo === "admin"));
      setPassword("");
      router.replace("/main-menu");
    } catch {
      setErrore("Impossibile completare il login. Verifica che frontend e backend siano avviati.");
    }
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

  if (stato === "caricamento") {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6 text-amber-100">
        <p>Verifica credenziali in corso...</p>
      </main>
    );
  }

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
            <Button type="submit">Entra nel Mondo</Button>
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
