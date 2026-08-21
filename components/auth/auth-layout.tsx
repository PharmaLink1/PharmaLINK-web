import Link from "next/link";
import { CircleCheck, Pill } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const points = [
  "See which nearby pharmacies have your medicine in stock",
  "Compare prices in ETB before you travel",
  "Plain-language drug information in Amharic and English",
];

/**
 * Clerk-style split screen: a branded panel on the left (desktop) and the form
 * on the right. On mobile the panel is hidden and just the form (with a logo) shows.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary-hover p-12 text-primary-foreground lg:flex">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold" aria-label="PharmaLink home">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/15">
            <Pill className="size-5" aria-hidden />
          </span>
          <span className="text-lg">PharmaLink</span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Find the medicines you need, at pharmacies near you.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-white/90" aria-hidden />
                <span className="text-primary-foreground/90">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-primary-foreground/70">
          Connecting patients and pharmacies across Ethiopia.
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
