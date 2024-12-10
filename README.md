# `respondable-event`

Enables event listeners to send at-most-one response back to the dispatching `EventTarget`.

## Background

Inspired by the [`FetchEvent`](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent) which is available to [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) only, the `RespondableEvent` allows event listeners to send a response back to the dispatching [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget).

This is useful in scenarios where custom elements need to communicate with the host asynchronously or infrequently. For persisted messaging, use `RespondableEvent` to set up [`Channel Messaging`](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API/Using_channel_messaging).

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
  { bubbles: true } // Make the event available to all ancestors.
);

element.dispatchEvent(event);

// If no response has been made or pending, calling the `checkResponse()` function
// will call the callback function with undefined.
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

### New `checkResponse` function

The `checkResponse()` function guarantees the `callback` function must be called exactly once. This helps reduce code complexity and its design is similar to the [`HTMLFormElement.checkValidity()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/checkValidity) function:

- If a prior response has been made, `checkResponse()` will return `true`.
- If no prior response is made, `checkResponse()` will call the `callback` function with `undefined`, and return `false`.

It is recommended to call `checkResponse()` after `dispatchEvent()` to guarantee the `callback` function is being called regardless `respondWith()` is called or not.

## Designs

### Callback function in constructor

The callback function follows the pattern found in [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver) and other observer classes. It is designed to limit the audience who can receive the response to the creator of the event.

## Behaviors

### Differences between `RespondableEvent` and `FetchEvent`?

- `RespondableEvent` extends from `Event`, where `FetchEvent` extends from `ExtendableEvent` and `Event`
- `request` property is optional in `RespondableEvent` where it is required in `FetchEvent`
- [`checkResponse()` function](#new-checkresponse-function) is new in `RespondableEvent`

## Contributions

Like us? [Star](https://github.com/compulim/respondable-event/stargazers) us.

Want to make it better? [File](https://github.com/compulim/respondable-event/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/respondable-event/pulls) a pull request.
