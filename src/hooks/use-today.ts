"use client";

import { useEffect, useState } from "react";
import { today } from "@/lib/dates";

/** Date du jour (locale), mise à jour si l'app reste ouverte après minuit. */
export function useToday() {
  const [value, setValue] = useState(today);
  useEffect(() => {
    const id = setInterval(() => setValue((prev) => (prev === today() ? prev : today())), 60_000);
    return () => clearInterval(id);
  }, []);
  return value;
}
