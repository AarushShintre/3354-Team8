'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useProfiles } from "@/lib/hooks/useProfiles";
import { Rating } from "@/lib/types";

export default function RatingsPage() {
  const { profiles } = useProfiles();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>();
  const [form, setForm] = useState<Rating>({
    fromUserId: 0,
    toUserId: 0,
    role: "driver",
    score: 5,
    comments: "",
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (profiles.length) {
      setForm((current) => ({
        ...current,
        fromUserId: current.fromUserId || profiles[0].id || 0,
      }));
    }
  }, [profiles]);

  useEffect(() => {
    if (!selectedProfileId && profiles.length) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const response = await api.fetchRatings(selectedProfileId);
        setRatings(response);
      } catch (err) {
        console.error(err);
        setStatus("We couldn't load reviews for this commuter. Please confirm the API is available.");
      }
    };
    void loadRatings();
  }, [selectedProfileId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fromUserId || !form.toUserId) {
      setStatus("Choose both the reviewer and the person being reviewed.");
      return;
    }
    if (form.fromUserId === form.toUserId) {
      setStatus("Reviewers can't rate themselves. Pick a different teammate.");
      return;
    }
    try {
      await api.submitRating(form);
      setStatus("Feedback published.");
      setForm((current) => ({ ...current, comments: "" }));
      if (selectedProfileId) {
        const refreshed = await api.fetchRatings(selectedProfileId);
        setRatings(refreshed);
      }
    } catch (err) {
      console.error(err);
      setStatus("We couldn't submit that review. Please try again once the API is reachable.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-500">Experience</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
              Close the loop on every ride
            </h1>
            <p className="text-sm text-zinc-500">
              CometCommuter captures structured feedback between riders and drivers so trust and accountability stay high.
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
          <p className="rounded-2xl bg-indigo-50 px-4 py-2 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">
            {status}
          </p>
        )}

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
          <h2 className="text-xl font-semibold">Share a review</h2>
          <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-sm font-medium">
              You are
              <select
                value={form.fromUserId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fromUserId: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600"
              >
                <option value={0}>Select profile</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Reviewing
              <select
                value={form.toUserId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, toUserId: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600"
              >
                <option value={0}>Choose teammate</option>
                {profiles
                  .filter((profile) => profile.id !== form.fromUserId)
                  .map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Role
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as Rating["role"],
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600"
              >
                <option value="driver">Driver</option>
                <option value="passenger">Passenger</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Score
              <input
                type="number"
                min="1"
                max="5"
                value={form.score}
                onChange={(event) =>
                  setForm((current) => ({ ...current, score: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600"
              />
            </label>
            <label className="text-sm font-medium lg:col-span-2">
              Review (optional)
              <textarea
                rows={3}
                value={form.comments}
                onChange={(event) =>
                  setForm((current) => ({ ...current, comments: event.target.value }))
                }
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600"
              />
            </label>
            <Button type="submit" className="lg:col-span-2">
              Submit rating
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">Browse ratings</h2>
            <label className="text-sm font-medium">
              for
              <select
                value={selectedProfileId ?? ""}
                onChange={(event) => setSelectedProfileId(Number(event.target.value))}
                className="ml-2 rounded-full border border-zinc-200 px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-600"
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-2">
            {ratings.length ? (
              ratings.map((rating) => (
                <div key={rating.id} className="rounded-2xl border border-zinc-200 bg-white/90 p-3 shadow-sm">
                  <p className="text-sm font-semibold">
                    {rating.role.toUpperCase()} · {rating.score}/5
                  </p>
                  <p className="text-xs text-zinc-500">
                    From user #{rating.fromUserId} → User #{rating.toUserId}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">{rating.comments || "No comment provided."}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                {selectedProfileId ? "No feedback yet." : "Select a profile to see their reviews."}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

