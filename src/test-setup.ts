/*
 * Setup dei test Vitest (jsdom). jsdom non implementa matchMedia, che ion-split-pane usa
 * appena entra nel DOM: senza lo stub il test della shell lascia un errore non gestito.
 */
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
