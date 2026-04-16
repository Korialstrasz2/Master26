"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { MainMenu } from "@/components/app/main-menu";
import { SkeletonLayout } from "@/components/app/skeleton-layout";

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

type StatoPagina = "caricamento" | "pronta";

export default function MainMenuPage() {
  const router = useRouter();
  const [utente, setUtente] = useState<string | null>(null);
  const [messaggio, setMessaggio] = useState("");
  const [sidebarAperta, setSidebarAperta] = useState(true);
  const [statoPagina, setStatoPagina] = useState<StatoPagina>("caricamento");

  const endpoint = useMemo(
    () => ({
      csrf: `${ottieniApiBaseUrl()}/auth/csrf/`,
      logout: `${ottieniApiBaseUrl()}/auth/logout/`,
      me: `${ottieniApiBaseUrl()}/auth/me/`,
      dashboard: `${ottieniApiBaseUrl()}/api/saluto/`,
      admin: `${ottieniApiBaseUrl()}/admin/`,
    }),
    [],
  );

  useEffect(() => {
    const inizializza = async () => {
      try {
        await fetch(endpoint.csrf, { credentials: "include" });
        const meResponse = await fetch(endpoint.me, { credentials: "include" });

        if (!meResponse.ok) {
          router.replace("/");
          return;
        }

        const meData = (await meResponse.json()) as { utente: string; ruolo: string };
        setUtente(meData.utente);
        localStorage.setItem("isMaster", String(meData.ruolo === "admin"));

        const dashboardResponse = await fetch(endpoint.dashboard, { credentials: "include" });
        if (dashboardResponse.ok) {
          const dashboardData = (await dashboardResponse.json()) as { messaggio: string };
          setMessaggio(dashboardData.messaggio);
        }

        setStatoPagina("pronta");
      } catch {
        router.replace("/");
      }
    };

    void inizializza();
  }, [endpoint.csrf, endpoint.dashboard, endpoint.me, router]);

  useEffect(() => {
    if (statoPagina !== "pronta") {
      return;
    }

    setSidebarAperta(true);
    const timer = window.setTimeout(() => {
      setSidebarAperta(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [statoPagina]);

  const leggiCsrfCookie = () => {
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith("csrftoken="));
    return cookie?.split("=")[1] ?? "";
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

    localStorage.removeItem("isMaster");
    router.replace("/");
  };

  if (statoPagina === "caricamento") {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6 text-amber-100">
        <p>Apertura main menu...</p>
      </main>
    );
  }

  const isMaster = localStorage.getItem("isMaster") === "true";

  return (
    <SkeletonLayout
      utente={utente}
      sidebarAperta={sidebarAperta}
      setSidebarAperta={setSidebarAperta}
      onLogout={onLogout}
    >
      <MainMenu isMaster={isMaster} adminUrl={endpoint.admin} messaggio={messaggio} />
    </SkeletonLayout>
  );
}
