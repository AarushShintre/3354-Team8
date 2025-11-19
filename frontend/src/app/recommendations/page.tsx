'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useProfiles } from "@/lib/hooks/useProfiles";
import { sortRecommendations } from "@/lib/calculations";
import { Rating, Recommendation } from "@/lib/types";

type RecommendationSort = "score" | "location" | "times" | "major" | "extracurriculars";

export default function RecommendationsPage() {
  const { profiles, refresh, isLoading } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [sortMode, setSortMode] = useState<RecommendationSort>("score");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!profiles.length) {
      setSelectedProfileId(undefined);
      return;
    }
    const hasSelectedProfile = profiles.some((profile) => profile.id === selectedProfileId);
    if (!selectedProfileId || !hasSelectedProfile) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    if (!selectedProfileId) return;
    const hydrate = async () => {
      try {
        const [recResponse, reviewResponse] = await Promise.all([
          api.fetchRecommendations(selectedProfileId),
          api.fetchReviews(selectedProfileId),
        ]);
        setRecommendations(recResponse);
        setReviews(reviewResponse);
        setStatus(null);
      } catch (err) {
        console.error(err);
        setStatus("We couldn't refresh matches. Please confirm the CometCommuter API is online.");
      }
    };
    void hydrate();
  }, [selectedProfileId]);

  const sorted = sortRecommendations(recommendations, sortMode);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-500">Matching</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
              Pair the right commuters instantly
            </h1>
            <p className="text-sm text-zinc-500">
              CometCommuter analyzes routines, majors, and extracurriculars so dispatchers can recommend the most compatible partners.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-indigo-600 hover:underline">
              ← Back to overview
            </Link>
            <Button variant="outline" size="sm" onClick={() => refresh()}>
              Refresh profiles
            </Button>
            <DarkModeToggle />
          </div>
        </div>

        {status && <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{status}</p>}

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">
              View matches for
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
            <label className="text-sm font-medium">
              Sort by
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as RecommendationSort)}
                className="ml-2 rounded-full border border-zinc-200 px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-600"
              >
                <option value="score">Best overall</option>
                <option value="location">Location</option>
                <option value="times">Driving times</option>
                <option value="major">Major</option>
                <option value="extracurriculars">Activities</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {sorted.map(({ user, score }) => (
              <div
                key={user.id}
                className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white p-4 shadow-sm dark:border-indigo-500/30 dark:from-indigo-500/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.location || "Location TBD"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-indigo-500">Score</p>
                    <p className="text-2xl font-bold text-indigo-600">{score}</p>
                  </div>
                </div>
                <dl className="mt-3 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <dt>Times</dt>
                    <dd>{user.typicalDrivingTimes || "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Major</dt>
                    <dd>{user.major || "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Activities</dt>
                    <dd>{user.extracurriculars || "Unknown"}</dd>
                  </div>
                </dl>
              </div>
            ))}
            {!sorted.length && (
              <p className="text-sm text-zinc-500">
                {isLoading ? "Loading profiles..." : "Add at least two profiles to see matches."}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
          <h2 className="text-xl font-semibold">Latest ride feedback</h2>
          <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-2">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-zinc-200 bg-white/90 p-3 shadow-sm">
                  <p className="text-sm font-semibold">
                    {review.role.toUpperCase()} · {review.score}/5
                  </p>
                  <p className="text-xs text-zinc-500">From user #{review.fromUserId}</p>
                  <p className="mt-1 text-sm text-zinc-700">{review.comments || "No comment provided."}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                {selectedProfileId ? "No riders have reviewed this commuter yet." : "Select a profile to see reviews."}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

