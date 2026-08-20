"use client";

import { useEffect, useState } from "react";

export function useDelayedFlag(active: boolean, delayMs = 4000): boolean {
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    if (!active) {
      setFlag(false);
      return;
    }
    const id = window.setTimeout(() => setFlag(true), delayMs);
    return () => window.clearTimeout(id);
  }, [active, delayMs]);

  return flag;
}
