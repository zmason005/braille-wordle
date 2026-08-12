"use strict";

/*
 * Dedicated worker that loads the liblouis browser build + Easy API and
 * exposes a tiny postMessage protocol for translating candidate suggestion
 * words into Grade 2 UEB braille, so main.js can verify a submitted word
 * actually occupies exactly 5 braille cells before it's sent to Formspree.
 *
 * This has to run in a worker (not the main thread) because liblouis's
 * on-demand table loading (enableOnDemandTableLoading) fetches .ctb/.dis
 * table files via synchronous XHR under the hood, and browsers only allow
 * synchronous XHR off the main thread.
 *
 * NOTE: this is unrelated to the desktop liblouis pipeline used to build
 * daily-word4.json (python-louis, which can't run on iOS). This is the
 * official liblouis C library cross-compiled to JS/WASM via emscripten,
 * running entirely client-side in the browser — it works fine on iOS
 * Safari because it's WASM executed by the JS engine, not a native shared
 * library loaded at runtime.
 */

const LIBLOUIS_BUILD_URL =
  "https://cdn.jsdelivr.net/gh/liblouis/js-build@master/build-no-tables-utf16.js";
const LIBLOUIS_EASYAPI_URL =
  "https://cdn.jsdelivr.net/gh/liblouis/liblouis-js@master/easy-api.js";
const LIBLOUIS_TABLES_BASE_URL =
  "https://cdn.jsdelivr.net/gh/liblouis/js-build@master/tables/";
// Same table chain the desktop pipeline uses: unicode.dis + en-ueb-g2.ctb
const LIBLOUIS_TABLE_LIST = "unicode.dis,en-ueb-g2.ctb";

let ready = false;
let initError = null;

function initLiblouis() {
  try {
    importScripts(LIBLOUIS_BUILD_URL);
    importScripts(LIBLOUIS_EASYAPI_URL);
    // `liblouis` is registered as a global by easy-api.js
    // eslint-disable-next-line no-undef
    liblouis.enableOnDemandTableLoading(LIBLOUIS_TABLES_BASE_URL);
    ready = true;
  } catch (e) {
    initError = (e && e.message) ? e.message : String(e);
  }
}

initLiblouis();

self.onmessage = function (evt) {
  const data = evt.data || {};
  const id = data.id;
  const words = Array.isArray(data.words) ? data.words : [];

  if (!ready) {
    self.postMessage({ id, ok: false, error: initError || "liblouis failed to load" });
    return;
  }

  try {
    const results = words.map(function (word) {
      // eslint-disable-next-line no-undef
      const brl = liblouis.translateString(LIBLOUIS_TABLE_LIST, word);
      // Each translated braille cell is exactly one Unicode code point in
      // the U+2800-U+28FF block, so a code-point-aware length is the cell count.
      const cellCount = brl ? Array.from(brl).length : 0;
      return { word: word, brl: brl, cellCount: cellCount };
    });
    self.postMessage({ id, ok: true, results });
  } catch (e) {
    self.postMessage({ id, ok: false, error: (e && e.message) ? e.message : String(e) });
  }
};
