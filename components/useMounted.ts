"use client";

import { useEffect, useState } from "react";

/** Returns true after the component has appeared in the browser (used to show a chart loading state). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
