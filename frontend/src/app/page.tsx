'use client';

import Link from "next/link";

import {
  ChartNoAxesColumnIncreasing,
  FileUser,
  Fuel,
  MessageSquareHeart,
  MoonStar,
  Users,
} from "lucide-react";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";

const features = [
  {
    Icon: FileUser,
    name: "Profile studio",
    description: "Capture verified rider + driver data in seconds.",
    href: "/profiles",
    cta: "Manage profiles",
    className: "lg:col-span-1 lg:row-start-1 lg:row-end-3 lg:col-start-1",
    gradient: "from-indigo-100 via-white to-transparent",
  },
  {
    Icon: Users,
    name: "Smart matching",
    description: "Surface compatibility scores by major, routine, and interests.",
    href: "/recommendations",
    cta: "View matches",
    className: "lg:col-span-1 lg:row-start-1 lg:row-end-2 lg:col-start-2",
    gradient: "from-emerald-100 via-white to-transparent",
  },
  {
    Icon: Fuel,
    name: "Payment guidance",
    description: "Translate distance & gas inputs into suggested contributions.",
    href: "/payments",
    cta: "Estimate fares",
    className: "lg:col-span-1 lg:row-start-2 lg:row-end-3 lg:col-start-2",
    gradient: "from-amber-100 via-white to-transparent",
  },
  {
    Icon: MessageSquareHeart,
    name: "Experience insights",
    description: "Collect respectful reviews after every ride.",
    href: "/ratings",
    cta: "Share reviews",
    className: "lg:col-span-1 lg:row-start-1 lg:row-end-2 lg:col-start-3",
    gradient: "from-violet-100 via-white to-transparent",
  },
  {
    Icon: ChartNoAxesColumnIncreasing,
    name: "Policies & intake",
    description: "Share expectations and route concerns to the ops team.",
    href: "/terms",
    cta: "Open policies",
    className: "lg:col-span-1 lg:row-start-2 lg:row-end-3 lg:col-start-3",
    gradient: "from-teal-100 via-white to-transparent",
  },
  {
    Icon: MoonStar,
    name: "Ops mode",
    description: "Toggle the workspace theme for day or night dispatch.",
    href: "/profiles",
    cta: "Open console",
    className: "lg:col-span-2 lg:row-start-3 lg:row-end-4 lg:col-start-2 lg:col-end-4",
    gradient: "from-slate-100 via-white to-transparent",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-sm dark:border-zinc-700 dark:bg-black/40">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-rose-500">CometCommuter</p>
              <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-white">
                The ops console for campus rideshare programs
              </h1>
              <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
                CometCommuter unifies roster management, rider matching, fare guidance, and feedback
                workflows so student mobility teams can ship a polished experience from day one.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/profiles">Launch workspace</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/terms">Review policies</Link>
                </Button>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
          <BentoGrid className="grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-3">
            {features.map((feature) => (
              <BentoCard
                key={feature.name}
                {...feature}
                background={
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-70`}
                  />
                }
              />
            ))}
          </BentoGrid>
        </section>
      </div>
    </main>
  );
}
