/**
 * Browser-only setup for onnxruntime-web. Kept separate from cnnClassifier.ts so Node tests (tsx) never see the Vite-only `?url` imports.
 * Importing the runtime files with `?url` lets Vite serve them in dev AND emit them as hashed assets in the production build.
 * (Pointing wasmPaths at /public breaks `npm run dev`: Vite refuses to import files from /public in source code.)
 */
import * as ort from 'onnxruntime-web/wasm';
import ortMjsUrl from '../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs?url';
import ortWasmUrl from '../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm?url';

ort.env.wasm.wasmPaths = { mjs: ortMjsUrl, wasm: ortWasmUrl };
ort.env.wasm.numThreads = 1; // avoids SharedArrayBuffer / cross-origin-isolation requirements
