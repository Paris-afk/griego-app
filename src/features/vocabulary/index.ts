// API pública del feature vocabulary — repaso por grupos temáticos.
//
// Vía PARALELA al curso: el curso tiene su orden y su ritmo (y eso es bueno),
// pero a veces solo quieres repasar los meses o la familia. Comparte
// vocabulario y dominio con el curso: es otra puerta al mismo contenido, no
// contenido aparte.

export { getVocabGroups, getVocabCards, groupLabel } from "./queries";
export type { VocabGroup, VocabCard } from "./queries";

export { VocabCardList } from "./components/vocab-card-list";
