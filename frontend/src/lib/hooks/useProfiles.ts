import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { UserProfile } from "@/lib/types";

export function useProfiles(autoFetch = true) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.listUsers();
      setProfiles(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to load profiles. Start the backend API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      void refresh();
    }
  }, [autoFetch, refresh]);

  return { profiles, setProfiles, isLoading, error, refresh };
}

