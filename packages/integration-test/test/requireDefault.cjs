/// <reference types="mocha" />

const { RespondableEvent } = require('respondable-event');

describe('CommonJS', () => {
  it('should work', () => {
    let called = [];
    const callback = (
      /** @type {any[]} */
      ...args
    ) => called.push(args);

    const event = new RespondableEvent('authenticate', callback);
    const target = new EventTarget();

    target.addEventListener('authenticate', (/** @type {any} */ event) => {
      event.respondWith('Hello, World!');
    });

    target.dispatchEvent(event);
  });
});
