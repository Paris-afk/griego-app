import type { Metadata, Viewport } from "next";
import { Newsreader, Noto_Sans } from "next/font/google";
import "./globals.css";

// Tipografía «Ánfora» (SCREENS.md §4.1):
//   Newsreader → títulos, texto del profesor, opciones de ejercicio.
//   Noto Sans  → TODO contenido griego (restricción pedagógica), incluido el
//                griego suelto dentro de prosa.
//   UI / etiquetas → stack del sistema (--font-ui, sin cargar nada).
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const notoSans = Noto_Sans({
  subsets: ["latin", "greek"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "Griego App",
  description:
    "Aprende griego moderno desde el español — A1 completo, con profesor de IA.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: { url: "/icons/icon.svg", type: "image/svg+xml" },
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Griego App",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F0",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${newsreader.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
