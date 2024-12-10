# `respondable-event`

Enables event listeners to send response back to the event dispatcher.

## Background

Inspired by the [`FetchEvent`](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent) which is available to [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) only, the `RespondableEvent` allows event listeners to send a response back to the dispatching [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget).

This is useful in scenarios where custom elements need to communicate with the host asynchronously or infrequently. For persisted messaging, use `RespondableEvent` to set up [`Channel Messaging`](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API/Using_channel_messaging) instead.

## How to use

The code snippet below send an `"authenticate"` event to the hosting page.

```ts
const event = new RespondableEvent(
  'authenticate',
  token => {
    if (token) {
      // Responded.
    } else {
      // No response.
    }
  },
  { bubbles: true } // Available to the whole page.
);

element.dispatchEvent(event);

// If `respondWith()` is not called, `checkResponse()`
// function will callback with `undefined`.
event.checkResponse();

const token = await authenticate.promise;
```

In the hosting page, the following code snippet respond with a token.

```ts
window.addEventListener('authenticate', event => {
  if (event.target === myTrustedElement && event.request === myTrustedRequest) {
    event.respondWith('Hello, World!');
    event.stopPropagation();
  }
});
```

The callback function passed to the constructor will be called *at most once*. Same as `FetchEvent`, the `respondWith()` function will throw if it is being called for more than once.

### New `checkResponse` function

The `checkResponse()` function guarantees the `callback` function must be called exactly once. This helps reduce code complexity. The API design is similar to the [`HTMLFormElement.checkValidity()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/checkValidity) function:

- If `respondWith()` was called, `checkResponse()` will return `true`.
- If `respondWith()` was never called, `checkResponse()` will call the `callback` function with `undefined`, and return `false`.

It is recommended to put `checkResponse()` immediately after `dispatchEvent()`.

## Designs

### Callback function in constructor

The callback function follows the pattern found in [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver) and other observers. It is designed to limit the number of audience who can look at the response.

## Behaviors

### Differences between `RespondableEvent` and `FetchEvent`

- `RespondableEvent` extends from [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event), where [`FetchEvent`](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent) extends from [`ExtendableEvent`](https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent)
- `request` property is optional in `RespondableEvent` where it is required in [`FetchEvent`](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/request)
- [`checkResponse()` function](#new-checkresponse-function) is new in `RespondableEvent`

## Contributions

Like us? [Star](https://github.com/compulim/respondable-event/stargazers) us.

Want to make it better? [File](https://github.com/compulim/respondable-event/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/respondable-event/pulls) a pull request.
