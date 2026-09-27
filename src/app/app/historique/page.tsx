import type { Metadata } from "next";
import { HistoryView } from "@/components/app/views/history";

export const metadata: Metadata = { title: "Historique" };

export default function Page() {
  return <HistoryView />;
}
