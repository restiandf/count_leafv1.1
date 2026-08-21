const SW_VERSION = "v3";
const CACHE_NAME = `btechlens-${SW_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./wiper.html",
  "./qc.html",
  "./btech.png",
  "./manifest.webmanifest",
  "./ort/ort.min.js",
  "./ort/ort-wasm.wasm",
  "./ort/ort-wasm-simd.wasm",
  "./besttutupdaunv1.2.onnx",
  "./bestwiperv1.6.onnx",
  "./bestqc_v1.1.onnx",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(ASSETS.map((url) => cache.add(url)));
      self.skipWaiting();
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "opaque"
          ) {
            return response;
          }

          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match("./index.html"));
    }),
  );
});
