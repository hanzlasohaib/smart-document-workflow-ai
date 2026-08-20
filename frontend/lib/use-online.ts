"use client";

import { useEffect, useState } from "react";

import { isBrowserOffline } from "@/lib/network";

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => !isBrowserOffline());

  useEffect(() => {
    const sync = () => setOnline(!isBrowserOffline());
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}
