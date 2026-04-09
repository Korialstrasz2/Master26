import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">Hello World Full Stack</h1>
      <p className="text-lg text-slate-600">
        Frontend pronto con Next.js, Tailwind e shadcn/ui.
      </p>
      <Button>Apri Dashboard</Button>
    </main>
  );
}
