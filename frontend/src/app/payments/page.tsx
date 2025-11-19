'use client';

import { useState } from "react";
import Link from "next/link";

import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function PaymentsPage() {
  const [paymentRequest, setPaymentRequest] = useState({ distanceMiles: 5, gasPrice: 3.7 });
  const [suggestion, setSuggestion] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.suggestPayment(paymentRequest);
      setSuggestion(response.suggestedAmount);
      setStatus(null);
    } catch (err) {
      console.error(err);
      setStatus("We couldn't reach the pricing service. Confirm the CometCommuter API is online.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] md:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-500">Payments</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
              Standardize every split
            </h1>
            <p className="text-sm text-zinc-500">
              Use CometCommuter's baseline MPG and wear-and-tear model to recommend transparent
              contributions before each trip.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-indigo-600 hover:underline">
              ← Back to overview
            </Link>
            <DarkModeToggle />
          </div>
        </div>

        {status && <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{status}</p>}

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="text-sm font-medium">
              Distance to campus (miles)
              <input
                type="number"
                min="0"
                step="0.1"
                value={paymentRequest.distanceMiles}
                onChange={(event) =>
                  setPaymentRequest((current) => ({
                    ...current,
                    distanceMiles: Number(event.target.value),
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-600"
              />
            </label>
            <label className="text-sm font-medium">
              Local gas price ($/gal)
              <input
                type="number"
                min="0"
                step="0.1"
                value={paymentRequest.gasPrice}
                onChange={(event) =>
                  setPaymentRequest((current) => ({
                    ...current,
                    gasPrice: Number(event.target.value),
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-600"
              />
            </label>
            <Button type="submit" className="w-full">
              Refresh suggestion
            </Button>
          </form>
          {suggestion !== null && (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
              Suggested contribution: ${suggestion.toFixed(2)}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

