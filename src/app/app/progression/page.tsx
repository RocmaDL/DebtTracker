import type { Metadata } from "next";
import { ProgressView } from "@/components/app/views/progress";

export const metadata: Metadata = { title: "Progression" };

export default function Page() {
  return <ProgressView />;
}
