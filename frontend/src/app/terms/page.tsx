'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function TermsPage() {
  const [terms, setTerms] = useState("");
  const [issue, setIssue] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const response = await api.fetchTerms();
        setTerms(response.terms);
      } catch (err) {
        console.error(err);
        setStatus("We couldn't load the current policy text. Confirm the CometCommuter API is running.");
      }
    };
    void loadTerms();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!issue.trim()) {
      setStatus("Add a brief summary before submitting.");
      return;
    }
    try {
      await api.reportIssue({ message: issue });
      setIssue("");
      setStatus("Thanks for the feedback!");
    } catch (err) {
      console.error(err);
      setStatus("We couldn't record that note. Please try again when the API is reachable.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] md:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-teal-500">Policies</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
              Publish standards. Capture signals.
            </h1>
            <p className="text-sm text-zinc-500">
              Share the latest CometCommuter ground rules and route every issue directly to operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-indigo-600 hover:underline">
              ← Back to overview
            </Link>
            <DarkModeToggle />
          </div>
        </div>

        {status && (
          <p className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
            {status}
          </p>
        )}

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
          <h2 className="text-xl font-semibold">Terms & conditions</h2>
          <p className="mt-4 whitespace-pre-line text-sm text-zinc-700">{terms}</p>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
          <h2 className="text-xl font-semibold">Report an issue</h2>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <textarea
              rows={4}
              value={issue}
              onChange={(event) => setIssue(event.target.value)}
              placeholder="Describe a bug, question, or policy concern..."
              className="w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-600"
            />
            <Button type="submit" className="w-full">
              Submit feedback
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}

