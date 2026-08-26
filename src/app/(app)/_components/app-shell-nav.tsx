"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CircleUserRound, House, Repeat, LogOut } from "lucide-react";

import { signOut } from "@/features/auth/actions";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { href: "/today", label: "Hoy", Icon: House },
  { href: "/course", label: "Curso", Icon: BookOpen },
  { href: "/review", label: "Repaso", Icon: Repeat },
  { href: "/profile", label: "Perfil", Icon: CircleUserRound },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/course") return pathname.startsWith("/course");
  return pathname === href;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-1 md:min-h-0 md:flex-row md:justify-start md:gap-3 md:px-4 md:py-3",
              active
                ? "text-[var(--color-primary-strong)]"
                : "text-[var(--color-text-soft)] hover:text-[var(--color-text)]",
            )}
          >
            <Icon width={21} height={21} strokeWidth={active ? 2.4 : 2} aria-hidden />
            <span
              className={cn(
                "text-[11px] tracking-[0.3px] md:text-[15px]",
                active && "font-semibold",
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </>
  );
}

// Barra de pestañas inferior en móvil; sidebar en escritorio (SCREENS.md §1).
export function AppShellNav() {
  return (
    <>
      {/* Móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-[var(--color-border-soft)] bg-[var(--color-surface)] md:hidden">
        <NavLinks />
      </nav>

      {/* Escritorio */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-border-soft)] bg-[var(--color-surface)] md:flex">
        <div className="px-5 py-6">
          <div className="font-display text-[22px] font-medium text-[var(--color-text)]">
            Griego App
          </div>
          <div className="text-[13px] text-[var(--color-text-soft)]">
            español → griego
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2">
          <NavLinks />
        </nav>
        <form action={signOut} className="px-2 pb-4">
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
          >
            <LogOut width={21} height={21} strokeWidth={2} aria-hidden />
            <span className="text-[15px]">Cerrar sesión</span>
          </button>
        </form>
      </aside>
    </>
  );
}
