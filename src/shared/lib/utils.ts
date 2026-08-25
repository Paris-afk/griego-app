import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combinador de clases de Tailwind: className={cn("base", cond && "extra")}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
