'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useProfiles } from "@/lib/hooks/useProfiles";
import { UserProfile } from "@/lib/types";

const emptyProfile = (): UserProfile => ({
  name: "",
  bio: "",
  location: "",
  typicalDrivingTimes: "",
  contactInfo: "",
  parkingPass: "",
  major: "",
  extracurriculars: "",
});

export default function ProfilesPage() {
  const { profiles, refresh, isLoading, error } = useProfiles();
  const [profileForm, setProfileForm] = useState<UserProfile>(emptyProfile());
  const [activeProfileId, setActiveProfileId] = useState<number | undefined>();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeProfileId) {
      const nextProfile = profiles.find((profile) => profile.id === activeProfileId);
      if (nextProfile) {
        setProfileForm(nextProfile);
      }
    }
  }, [activeProfileId, profiles]);

  const getTimeBucket = (value: string | undefined) => {
    const normalized = (value ?? "").toLowerCase();
    if (!normalized) return "unspecified";
    if (normalized.includes("morning") || normalized.includes("am")) return "morning";
    if (normalized.includes("evening") || normalized.includes("night") || normalized.includes("pm")) {
      return "evening";
    }
    return "other";
  };

  const rosterSummary = useMemo(() => {
    return profiles.reduce(
      (acc, profile) => {
        const bucket = getTimeBucket(profile.typicalDrivingTimes);
        if (bucket === "morning") acc.morningDrivers += 1;
        else if (bucket === "evening") acc.eveningDrivers += 1;
        else acc.otherDrivers += 1;
        return acc;
      },
      { total: profiles.length, morningDrivers: 0, eveningDrivers: 0, otherDrivers: 0 },
    );
  }, [profiles]);

  const handleStatus = (message: string, variant: "success" | "error" = "success") => {
    setStatusMessage(message);
    setStatusVariant(variant);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleProfileChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profileForm.name.trim()) {
      handleStatus("Add a display name before publishing this profile.", "error");
      return;
    }
    setIsSaving(true);
    try {
      if (activeProfileId) {
        await api.updateUser(activeProfileId, profileForm);
        handleStatus("Profile updated.", "success");
      } else {
        await api.createUser(profileForm);
        handleStatus("Profile created.", "success");
      }
      setProfileForm(emptyProfile());
      setActiveProfileId(undefined);
      await refresh();
    } catch (err) {
      console.error(err);
      handleStatus("We couldn't reach the CometCommuter API. Confirm the backend service is running.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeProfileId) return;
    try {
      await api.deleteUser(activeProfileId);
      handleStatus("Profile deleted.", "success");
      setActiveProfileId(undefined);
      setProfileForm(emptyProfile());
      await refresh();
    } catch (err) {
      console.error(err);
      handleStatus("We couldn't delete that profile. Please confirm the API is online.", "error");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-500">Roster</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
              Manage riders and drivers with confidence
            </h1>
            <p className="text-sm text-zinc-500">
              CometCommuter keeps every commuter profile, credential, and preference centralized for your mobility team.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-indigo-600 hover:underline">
              ← Back to overview
            </Link>
            <DarkModeToggle />
          </div>
        </div>

        {statusMessage && (
          <div
            className={`rounded-2xl px-4 py-2 text-sm ${
              statusVariant === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {activeProfileId ? "Edit profile" : "Create profile"}
              </h2>
              {activeProfileId && (
                <button
                  onClick={() => {
                    setActiveProfileId(undefined);
                    setProfileForm(emptyProfile());
                  }}
                  className="text-sm text-indigo-600 hover:underline"
                  type="button"
                >
                  Start new
                </button>
              )}
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                {["name", "location", "typicalDrivingTimes", "contactInfo", "parkingPass", "major"].map(
                  (field) => (
                    <label key={field} className="text-sm font-medium">
                      <span className="block text-xs uppercase tracking-wide text-zinc-500">
                        {field.replace(/([A-Z])/g, " $1")}
                      </span>
                      <input
                        name={field}
                        value={(profileForm as Record<string, string>)[field] ?? ""}
                        onChange={handleProfileChange}
                        required={field === "name"}
                        className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-indigo-500 focus:outline-none dark:border-zinc-600 dark:bg-black/20"
                      />
                    </label>
                  ),
                )}
              </div>
              <label className="text-sm font-medium">
                <span className="block text-xs uppercase tracking-wide text-zinc-500">Bio</span>
                <textarea
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-indigo-500 focus:outline-none dark:border-zinc-600 dark:bg-black/20"
                />
              </label>
              <label className="text-sm font-medium">
                <span className="block text-xs uppercase tracking-wide text-zinc-500">
                  Extracurriculars
                </span>
                <textarea
                  name="extracurriculars"
                  value={profileForm.extracurriculars}
                  onChange={handleProfileChange}
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-indigo-500 focus:outline-none dark:border-zinc-600 dark:bg-black/20"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isSaving}>
                  {activeProfileId ? "Save changes" : "Create profile"}
                </Button>
                {activeProfileId && (
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    Delete profile
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-black/40">
            <h2 className="text-xl font-semibold">Roster</h2>
            <p className="text-sm text-zinc-500">
              {isLoading && "Syncing with backend..."}
              {error && <span className="text-rose-500">{error}</span>}
              {!isLoading && !error && `${rosterSummary.total} profiles`}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-center dark:border-indigo-500/40 dark:bg-indigo-500/10">
                <p className="text-2xl font-bold">{rosterSummary.total}</p>
                <p className="text-xs text-zinc-500">Total members</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center dark:border-amber-500/40 dark:bg-amber-500/10">
                <p className="text-2xl font-bold">{rosterSummary.morningDrivers}</p>
                <p className="text-xs text-zinc-500">Morning</p>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 text-center dark:border-purple-500/40 dark:bg-purple-500/10">
                <p className="text-2xl font-bold">{rosterSummary.eveningDrivers}</p>
                <p className="text-xs text-zinc-500">Evening</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-600 dark:bg-black/20">
                <p className="text-2xl font-bold">{rosterSummary.otherDrivers}</p>
                <p className="text-xs text-zinc-500">Flexible/unspecified</p>
              </div>
            </div>

            <div className="mt-6 max-h-[420px] space-y-3 overflow-y-auto pr-2">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setActiveProfileId(profile.id);
                    setProfileForm(profile);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    profile.id === activeProfileId
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-zinc-200 bg-white hover:border-indigo-200"
                  }`}
                >
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-xs text-zinc-500">
                    {profile.location || "Location TBD"} · {profile.typicalDrivingTimes || "Times TBD"}
                  </p>
                  <p className="text-xs text-zinc-500">{profile.major || "Major TBD"}</p>
                </button>
              ))}
              {!profiles.length && !isLoading && (
                <p className="text-sm text-zinc-500">No profiles yet. Start by creating one on the left.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

