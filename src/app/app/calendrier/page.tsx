import type { Metadata } from "next";
import { CalendarView } from "@/components/app/views/calendar";

export const metadata: Metadata = { title: "Calendrier" };

export default function Page() {
  return <CalendarView />;
}
