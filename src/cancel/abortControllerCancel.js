import 'abort-controller/polyfill';

let AbortController = undefined;
let AbortSignal = undefined;

const g =
  typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : /* otherwise */ undefined;

if (g) {
  AbortController = typeof g.AbortController !== 'undefined' ? g.AbortController : AcAbortController;
  AbortSignal = typeof g.AbortSignal !== 'undefined' ? g.AbortSignal : AcAbortSignal;
}

export default AbortController;

export { AbortController, AbortSignal };
