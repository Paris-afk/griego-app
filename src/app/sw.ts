import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { CacheFirst, ExpirationPlugin, Serwist } from "serwist";

// Declara el valor de `injectionPoint` para TypeScript. Es la cadena que Serwist
// reemplaza por el manifiesto de precache real.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Los ~236 mp3 de vocabulario son CONTENIDO ESTÁTICO que no cambia salvo que
// se regeneren (Fase 3.5): CacheFirst es exactamente su caso. Sin esto, el
// botón de audio y el dictado no funcionan sin red — y estudiar en el metro es
// medio sentido de que sea una PWA.
//
// Pesan ~2,8 MB en total, así que cachearlos a demanda (no de golpe) mantiene
// la instalación ligera: solo se guarda lo que se ha llegado a escuchar.
const audioCache: RuntimeCaching = {
  matcher: ({ url, request }) =>
    request.destination === "audio" || url.pathname.startsWith("/audio/el/"),
  handler: new CacheFirst({
    cacheName: "griego-audio",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 300,
        maxAgeSeconds: 60 * 60 * 24 * 365,
        purgeOnQuotaError: true,
      }),
    ],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [audioCache, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
