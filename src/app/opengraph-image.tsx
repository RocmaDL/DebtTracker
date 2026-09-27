import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "DebtTracker · Chaque burger se paie en minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");

export default async function Image() {
  const [semibold, regular] = await Promise.all([
    readFile(join(fontDir, "Geist-SemiBold.ttf")),
    readFile(join(fontDir, "Geist-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 15% 0%, rgba(212,255,58,0.22), transparent 45%), radial-gradient(circle at 95% 90%, rgba(255,91,58,0.22), transparent 45%), #050607",
          color: "#f3f4f6",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill="#d4ff3a" />
            <path d="M8 22.5h9" stroke="#050607" strokeWidth="3" strokeLinecap="round" />
            <path d="M18.5 7 12 17h6l-2.5 8L23 14h-6l1.5-7Z" fill="#050607" />
          </svg>
          <div style={{ fontSize: 34, fontWeight: 600, display: "flex" }}>
            Debt<span style={{ color: "#d4ff3a" }}>Tracker</span>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 20, padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", color: "#a3a9b3" }}>
            Projet vitrine · Next.js
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: -4, lineHeight: 1 }}>Chaque burger se paie</div>
          <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: -4, lineHeight: 1.1, color: "#d4ff3a" }}>en minutes.</div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 30, color: "#a3a9b3" }}>
          <span>Burger 13,90 €</span>
          <span style={{ color: "#ff5b3a" }}>→ +14 min de dette</span>
          <span style={{ color: "#d4ff3a" }}>→ 74 min de sport</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
        { name: "Geist", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
