'use client';

import { useEffect, useState } from "react";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", enabled);
    return () => {
      document.body.classList.remove("dark");
    };
  }, [enabled]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setEnabled((current) => !current)}
      className="flex items-center gap-2"
    >
      {enabled ? (
        <>
          <Sun className="h-4 w-4" /> Light
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" /> Dark
        </>
      )}
    </Button>
  );
}

