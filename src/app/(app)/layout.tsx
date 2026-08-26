import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth";
import { AppShellNav } from "./_components/app-shell-nav";

// Shell de la app con navegación (tabs móvil / sidebar escritorio).
// Protegido: exige sesión y perfil (onboarding) antes de mostrar contenido.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile) redirect("/onboarding");

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <AppShellNav />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
    </div>
  );
}
