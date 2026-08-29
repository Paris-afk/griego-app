# Contenido — fuente de verdad

Estos CSV son la **fuente de verdad del contenido**. La base de datos es una proyección: borrar `dev.db`, correr el seed, y todo vuelve (ARCHITECTURE.md §3, principio 1).

Editar el contenido = editar estos archivos y volver a sembrar. Nunca editar la BD a mano.

---

## Archivos

| Archivo | Filas | Contenido |
|---|---|---|
| `a1-modulo0-alfabeto.csv` | 24 | Las 24 letras. **Esquema propio** (ver abajo) |
| `a1-modulo1-saludos.csv` | 31 | Saludos, cortesía, presentarse, números 1-10 |
| `a1-modulo2-familia.csv` | 29 | Familia, verbos tipo B1, plural |
| `a1-modulo3-rutina-comida.csv` | 38 | Rutina y comida, acusativo |
| `a1-modulo4-numeros-compras.csv` | 51 | Números 11-100, días, meses, compras, genitivo |
| `a1-modulo5-viajes-planes.csv` | 33 | Viajes, subjuntivo con να |
| `a1-modulo6-pasado-futuro.csv` | 30 | Aóristo y futuro simple |
| `contrastive-es-el.csv` | 13 | Notas contrastivas del par es→el |

**Total: 212 entradas de vocabulario** para el A1 completo — dentro del rango de 500-700 palabras que CURRICULUM.md §2 estima para A1, contando que muchas lecciones reutilizan y combinan estas entradas.

---

## Esquema de vocabulario (módulos 1-6, todos idénticos)

```
griego,articulo,forma_base,transliteracion,espanol,categoria,tipo_palabra,emoji,nota
```

| Columna | Obligatoria | Descripción |
|---|---|---|
| `griego` | sí | El término. **Solo caracteres griegos** — el seed debe rechazar letras latinas aquí |
| `articulo` | en sustantivos | `ο` masc · `η` fem · `το` neutro · `οι`/`τα` plural. Vacío si no es sustantivo. Va separado para que un ejercicio pueda pedir el artículo o el término por separado |
| `forma_base` | no | Solo en el módulo 6: el presente del que deriva un aóristo, para ejercicios de transformación |
| `transliteracion` | sí | **Escrita para hispanohablante** (ver abajo) |
| `espanol` | sí | Traducción |
| `categoria` | sí | Agrupación temática dentro del módulo |
| `tipo_palabra` | sí | `sustantivo` · `verbo` · `adjetivo` · `adverbio` · `numeral` · `expresión` · `partícula` |
| `emoji` | no | Ilustración **offline**. Es la que siempre funciona: sin red, sin licencia, instantánea. Vacío cuando un emoji no aporta (verbos abstractos, números, días) — uno genérico sería ruido |
| `nota` | no | Alimenta el feedback del profesor IA. Etimologías, trampas, variantes ortográficas |

**Validación que el seed debe aplicar** (falla ruidosamente, ARCHITECTURE.md §7 punto 1):
- `griego` sin caracteres latinos
- `articulo` ∈ {`ο`,`η`,`το`,`οι`,`τα`,vacío}
- todo `tipo_palabra: sustantivo` tiene `articulo`
- `tipo_palabra` dentro del conjunto permitido

## Esquema del alfabeto (`a1-modulo0-alfabeto.csv`)

Deliberadamente distinto: las letras no son vocabulario y forzarlas al mismo esquema las volvería confusas.

```
orden,mayuscula,minuscula,nombre_gr,nombre_translit,sonido_ipa,equivalente_es,transferencia,nota
```

`transferencia` ∈ {`POSITIVA`,`NEGATIVA`,`NEUTRA`} — 19 de las 24 letras son POSITIVA para un hispanohablante.

## Esquema contrastivo (`contrastive-es-el.csv`)

```
feature,error_tag,transfer_type,note,bridge_language
```

`bridge_language` se inyecta **literalmente** en el prompt de DeepSeek cuando ese `error_tag` aparece en el turno (ARCHITECTURE.md §6.2). Escribirlo como se lo dirías a un alumno.

---

## La transliteración es del PAR, no del idioma

Todas las transliteraciones están escritas **para un hispanohablante**:

| Letra griega | Aquí se escribe | Porque |
|---|---|---|
| χ | `j` | La j de "jamón". Un angloparlante necesitaría `ch` o `kh` |
| δ | `d` | La d de "cada" |
| β | `v` | Nunca `b` |
| θ | `th` | El español latinoamericano no tiene este sonido |
| η, ι, υ, ει, οι | `i` | Las cinco suenan igual |
| ω, ο | `o` | Las dos suenan igual |

**Si algún día se agrega el par inglés→griego, esta columna no se reutiliza: se reescribe entera.** Es la demostración concreta de por qué la transliteración pertenece al `Course` (el par) y no al `Language` — ver CURRICULUM.md §4.

---

## Al agregar contenido nuevo

1. Editar el CSV, respetando el esquema exacto.
2. Correr el seed y verificar que no falle la validación.
3. Si el contenido introduce una dificultad específica del par es→el, agregar también su fila en `contrastive-es-el.csv`.
