# Pantallas y sistema de diseño — Griego App

> Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para el stack y [PLAN.md](./PLAN.md) para el roadmap.
> **Regla base:** **mobile-first**. Cada pantalla se diseña primero para un iPhone en la mano y después se expande a escritorio. Nada se diseña "en desktop y luego se encoge".

---

## 1. Mapa de navegación

```
Bienvenida ──► Onboarding (3 pasos) ──┐
                                       ▼
             ┌──────────── APP (navegación persistente) ────────────┐
             │  Móvil: tab bar inferior · Escritorio: sidebar izq.   │
             │                                                       │
             │  [Hoy]      [Curso]        [Repaso]      [Perfil]     │
             │    │           │              │             │         │
             │    │           ▼              ▼             ▼         │
             │    │      Mapa del curso   Cola SM-2    Progreso      │
             │    │           │                         Vocabulario  │
             │    │           ▼                         Ajustes      │
             │    │        Módulo                                    │
             │    │           │                                      │
             │    └───────────┴──────────┐                           │
             └───────────────────────────┼───────────────────────────┘
                                         ▼
                          ┌─────────────────────────────┐
                          │  LECCIÓN (pantalla completa,│
                          │  sin navegación — modo foco) │
                          │  ejercicio → feedback → …    │
                          └──────────────┬───────────────┘
                                         ▼
                                  Fin de lección
```

**Decisión clave:** la lección es **modo foco** — ocupa toda la pantalla y oculta la navegación. Es la pantalla donde de verdad se aprende; todo lo demás existe para llevarte ahí.

---

## 2. Inventario de pantallas

| # | Pantalla | Propósito | Fase |
|---|---|---|---|
| 1 | **Bienvenida / Login** | Entrada mínima (usuario + contraseña) | 2 |
| 2 | **Onboarding** | 3 pasos: idioma → nivel → meta diaria | 2 |
| 3 | **Hoy** *(home)* | Saludo, racha, anillo de meta diaria, tarjeta "continuar lección", repasos pendientes, palabra del día | 2 |
| 4 | **Curso (mapa)** | Niveles → módulos, con estado: completado · en curso · bloqueado | 2 |
| 5 | **Módulo** | Lista de lecciones con progreso y tipo (vocabulario / gramática / lectura) | 2 |
| 6 | **Lección** ⭐ | El motor de ejercicios en modo foco | 3 |
| 7 | **Hoja de feedback** | Resultado + explicación del profesor IA | 5 |
| 8 | **Fin de lección** | Puntos, precisión, palabras nuevas, racha, errores a repasar | 3 |
| 9 | **Alfabeto** | Referencia interactiva de las 24 letras (mayús/minús, sonido, ejemplo) | 4 |
| 10 | **Repaso** | Cola diaria de repetición espaciada (SM-2) | 6 |
| 11 | **Vocabulario** | Diccionario personal: buscar, filtrar, ver dominio por palabra | 6 |
| 12 | **Perfil / Progreso** | Racha, stats, y **tus errores recurrentes** (el `LearnerSnapshot` hecho visible) | 6 |
| 13 | **Lectura** | Texto con vocabulario tocable + preguntas de comprensión | 7 |
| 14 | **Ajustes** | Meta diaria, tema, datos, cerrar sesión | 6 |

---

## 3. Anatomía de las pantallas críticas

### 3.1 Lección (la más importante)

```
┌────────────────────────────────────┐
│ ✕     ▓▓▓▓▓▓▓░░░░░░░░░     7/12    │  header: salir + progreso
├────────────────────────────────────┤
│                                    │
│  ¿Qué significa esta palabra?      │  instrucción (secundaria)
│                                    │
│         δ έ ν τ ρ ο                │  prompt en GRIEGO, grande,
│           déntro                   │  con transliteración debajo
│              🔊                     │  (icono SVG, no emoji)
│                                    │
│  ┌────────────────────────────────┐│
│  │ ◉  árbol                       ││  opciones: alto ≥56px,
│  └────────────────────────────────┘│  indicador + texto
│  ┌────────────────────────────────┐│
│  │ ○  mar                         ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ ○  libro                       ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ ○  casa                        ││
│  └────────────────────────────────┘│
├────────────────────────────────────┤
│  [        Comprobar        ]       │  CTA anclado abajo (pulgar)
└────────────────────────────────────┘
```

**Reglas de la pantalla de lección:**
- El **término griego siempre es el elemento más grande** de la pantalla. Es lo que hay que aprender.
- La transliteración va debajo, más pequeña y en el gris *suave del token*, nunca en un gris inventado (§4.3).
- **Opciones de texto → lista de una columna. Opciones con imagen → grilla 2×2.** El texto se lee peor en grilla y deja huecos muertos; las imágenes se comparan mejor lado a lado.
- Cada opción lleva **indicador (radio/check) además del color** — el color nunca es la única señal.
- El CTA vive **anclado en la zona del pulgar**, nunca flotando a media pantalla, y mide **56px**.
- Sin animaciones que retrasen: el feedback aparece en <100 ms para respuestas correctas.

### 3.2 Hoja de feedback (donde vive el profesor IA)

Aparece como *bottom sheet* que sube sobre el ejercicio, con dos estados muy distintos:

**Correcto** — barra compacta, verde, instantánea, sin llamada a IA:
```
  ✓  ¡Correcto!   δέντρο = árbol            [Continuar]
```

**Incorrecto** — hoja expandida con la estructura del profesor:
```
┌────────────────────────────────────┐
│  ✕  Casi          ACENTO FALTANTE  │  veredicto + errorTag
│                                    │
│  ESCRIBISTE   δεντρο               │  lo tuyo (tachado)
│  CORRECTO     δέντρο               │  lo correcto (acento resaltado)
│  ─────────────────────────────────  │
│  TU PROFESOR                        │  explicación de DeepSeek
│  Te faltó el acento agudo en la έ.  │  (2-3 frases, en español)
│  En griego el acento marca qué      │
│  sílaba suena más fuerte.           │
│                                    │
│  ⏱ Es la 3ª vez esta semana —       │  contexto del LearnerSnapshot
│    lo agregué a tu repaso.          │
│                                    │
│  [        Entendido        ]       │
└────────────────────────────────────┘
```

**Por qué así:** el orden *qué escribiste → qué era correcto → por qué → qué sigue* es deliberado. Ver el propio error primero es lo que hace que la corrección se fije.

**Regla de contenido del ejemplo:** la respuesta incorrecta mostrada debe diferir de la correcta **solo en el error que el profesor explica**. `δεντρο` vs `δέντρο` difiere únicamente en el acento — si difiriera también en una letra, el ejemplo enseñaría mal. Aplica igual al contenido real: un `errorTag` = un error señalado.

### 3.3 Hoy (home)

Jerarquía descendente: **anillo de meta diaria** (lo más grande, arriba) → **tarjeta de continuar** (el CTA real) → repasos pendientes → racha y palabra del día. Una sola acción obvia por pantalla.

### 3.4 Teclado griego en pantalla

Componente reutilizable, no una pantalla. Layout griego (ΕΡΤΥΘΙΟΠ / ΑΣΔΦΓΗΞΚΛ / ΖΧΨΩΒΝΜ), con **tecla de acento** (´) y **ς final** accesibles sin submenús — son exactamente los dos errores más frecuentes de un principiante, así que no pueden estar escondidos.

---

## 4. Sistema de diseño

### 4.1 Tipografía

| Uso | Fuente | Razón |
|---|---|---|
| **UI en español** | SF Pro (`-apple-system`), fallback **Inter** | Es *la* tipografía de iOS: la app se siente nativa en el iPhone sin pedir permiso |
| **Contenido en griego** | **Noto Sans** (su cobertura griega; en Google Fonts, familia `Noto Sans`) | Elegida por **claridad pedagógica**: distingue bien ο/σ y ξ/ζ — letras que un principiante confunde. Una fuente "bonita" pero ambigua sabotearía el aprendizaje. **Aplica también al griego suelto dentro de un párrafo** (la έ en una explicación), así que va en el stack raíz, no solo en los términos grandes |
| **Números y stats** | Cualquiera con *tabular figures* | Evita que los contadores "bailen" al actualizarse |

**Escala tipográfica (basada en iOS):**

| Rol | Tamaño / peso | Uso |
|---|---|---|
| Display griego | 44-56 / Medium | El término a aprender |
| Large Title | 34 / Bold | Título de pantalla |
| Title 2 | 22 / Bold | Encabezados de sección |
| Headline | 17 / Semibold | Opciones, botones |
| Body | 17 / Regular | Texto general, explicaciones del profesor |
| Subhead | 15 / Regular | Instrucciones del ejercicio |
| Footnote | 13 / Regular | Transliteración, metadatos |

**Regla de espaciado:** todo múltiplo de **4px**.

**Áreas táctiles — mínimos que se verifican, no que se suponen:**

| Elemento | Mínimo |
|---|---|
| Cualquier cosa tocable (✕, chevrons, iconos) | **44×44px** — un SVG de 22px necesita una caja de 44px alrededor, no basta el icono |
| Ítems de la barra de pestañas | **44px** de alto |
| Opciones de ejercicio | **56px** de alto |
| CTA principal (Comprobar, Continuar, Entendido) | **56px** de alto |

### 4.2 Paleta — «Ánfora» ✅ *dirección elegida (2026-08-23)*

Papiro, terracota y oliva. Se siente como un **cuaderno de estudio**, no como una app de productividad: fondo cálido, líneas finas en lugar de sombras, esquinas casi rectas, y un serif editorial (**Newsreader**) para títulos y para el texto del profesor.

Se eligió sobre «Egeo» (iOS nativo, más segura pero anónima) y «Mármol nocturno» (dark-first, más enfocada pero fría de día). El costo asumido: es la más lejana al lenguaje visual de iOS, así que se verá deliberadamente distinta al resto del teléfono.

| Token | Claro | Oscuro |
|---|---|---|
| Primario | `#B4532A` | `#E07A4F` |
| Primario oscuro *(texto sobre fondo claro)* | `#A0431F` | — |
| Secundario (oliva) | `#5A6A3C` | `#93A86B` |
| Fondo | `#FAF6F0` | `#1A1613` |
| Superficie | `#FFFFFF` | `#241F1B` |
| Borde | `#DCC9B4` | `#3A322B` |
| Borde suave | `#E0D6C8` | `#2E2822` |
| Texto | `#2B2622` | `#F0EAE2` |
| Texto suave | `#6E6155` | `#B3A695` |
| Acierto | `#48702E` | `#7FB356` |
| Error | `#B03A22` | `#E8674C` |
| Racha / puntos | `#8A5D18` | `#E3B341` |

> El modo oscuro aún **no está diseñado**, solo tokenizado. Se diseña cuando el modo claro esté construido — no antes, para no mantener dos cosas que todavía cambian.

**Tipografía de la dirección:**

| Rol | Fuente |
|---|---|
| Títulos, texto del profesor, opciones de ejercicio | **Newsreader** (serif editorial) |
| UI, etiquetas, botones, metadatos | Stack del sistema (`-apple-system`) |
| Contenido griego | **Noto Sans** — no cambia; es restricción pedagógica |

### 4.3 Reglas transversales de color

- **El color nunca es la única señal.** Acierto/error/selección siempre llevan además ícono y texto (daltonismo + accesibilidad).
- **El primario se reserva para la acción principal.** Si todo es azul, nada es azul.
- **El griego se pinta con el color de texto, no con el primario** — es contenido, no un enlace.
- Ambos modos (claro/oscuro) se definen con *tokens CSS*, nunca con colores sueltos en los componentes.
- **Solo se usan los grises de la tabla.** Inventar un gris intermedio "que se ve bien" es cómo se cuela texto a 2.6:1. Los textos secundarios usan el token *texto suave* de su modo — y el token del modo claro **no** se usa sobre fondo oscuro ni al revés.
- Cualquier texto por debajo de **4.5:1** (o 3:1 si es ≥24px) se corrige, no se justifica.

---

## 5. Estado

- ✅ Inventario de pantallas y anatomía definidos.
- ✅ **Dirección visual elegida: «Ánfora»** (2026-08-23). Mockups de Hoy · Lección · Feedback aprobados.
- ✅ Tokens de §4.2 ya convertidos: [`design/tokens.css`](./design/tokens.css) (CSS) y [`design/tailwind.tokens.ts`](./design/tailwind.tokens.ts) (Tailwind), listos para copiar en la Fase 0.
- 🔜 **Siguiente:** diseñar las pantallas que aún no tienen mockup (Curso, Módulo, Alfabeto, Fin de lección, Perfil) cuando el roadmap llegue a esas fases.

---

*Documento vivo — se actualiza junto con [PLAN.md](./PLAN.md).*
