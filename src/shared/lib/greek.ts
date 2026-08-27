// Lógica pura del teclado griego (sin JSX), testeable con Vitest.
// El acento (´) es una TECLA MUERTA: se aplica a la siguiente vocal, no a la
// última letra escrita (así puedes acentuar cualquier vocal de la palabra).

// Acento monotónico: α→ά, ε→έ, η→ή, ι→ί, ο→ό, υ→ύ, ω→ώ.
export const ACCENT_MAP: Record<string, string> = {
  α: "ά",
  ε: "έ",
  η: "ή",
  ι: "ί",
  ο: "ό",
  υ: "ύ",
  ω: "ώ",
};

export function isVowel(ch: string): boolean {
  return ch in ACCENT_MAP;
}

// Devuelve la letra acentuada si es vocal; si no, la deja igual.
export function accentCharacter(ch: string): string {
  return ACCENT_MAP[ch] ?? ch;
}

// Retira la última letra (backspace).
export function backspace(value: string): string {
  return value.slice(0, -1);
}
