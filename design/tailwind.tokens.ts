/**
 * Extensión de tema de Tailwind para la dirección «Ánfora» (SCREENS.md §4.2).
 *
 * Uso en tailwind.config.ts (Tailwind v3):
 *   import { anforaTheme } from './design/tailwind.tokens'
 *   export default { theme: { extend: anforaTheme } }
 *
 * Si el proyecto usa Tailwind v4 (config CSS-first con @theme en globals.css),
 * este archivo sigue sirviendo como referencia de los valores — traducir cada
 * entrada a una variable dentro del bloque @theme en vez de importar este objeto.
 *
 * Todos los colores leen de design/tokens.css vía var(--color-*), NUNCA se
 * repiten los hex aquí — un solo lugar de verdad para cada valor.
 */

export const anforaTheme = {
  colors: {
    primary: {
      DEFAULT: 'var(--color-primary)',
      strong: 'var(--color-primary-strong)',
    },
    secondary: 'var(--color-secondary)',
    background: 'var(--color-background)',
    surface: 'var(--color-surface)',
    border: {
      DEFAULT: 'var(--color-border)',
      soft: 'var(--color-border-soft)',
    },
    text: {
      DEFAULT: 'var(--color-text)',
      soft: 'var(--color-text-soft)',
    },
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    streak: 'var(--color-streak)',
  },
  fontFamily: {
    display: ['var(--font-display)'],
    ui: ['var(--font-ui)'],
    greek: ['var(--font-greek)'],
  },
  borderRadius: {
    card: 'var(--radius-card)',
    button: 'var(--radius-button)',
    pill: 'var(--radius-pill)',
  },
} as const;
