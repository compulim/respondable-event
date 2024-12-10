interface RespondableEventInit<T> extends EventInit {
  /** The object that would have triggered the event handler. */
  request: T;
}

class RespondableEvent<T, R = undefined> extends Event {
  constructor(
    /** A string with the name of the event. */
    type: string,
    /** A function which will be called upon respond. */
    callback: (result: T | undefined, event: RespondableEvent<T, R>) => void,
    /**
     * An object that, in addition of the properties defined in [Event()](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event), can have the following properties:
     *
     * - `request`: The object that would have triggered the event handler.
     */
    eventInitDict?: RespondableEventInit<R> | undefined
  ) {
    super(type, eventInitDict);

    this.#request = eventInitDict?.request;

    const resolvers = Promise.withResolvers<T | undefined>();

    resolvers.promise.then(result => callback(result, this));

    this.#resolve = (result: Promise<T> | T | undefined) => {
      if (this.#resolved) {
        throw new Error('respondWith() has already been invoked.');
      } else if (!this.target) {
        throw new Error('respondWith() can only be called after dispatched.');
      }

      resolvers.resolve(result);

      this.#resolved = true;
    };
  }

  #request: R | undefined;
  #resolve: (result: Promise<T> | T | undefined) => void;
  #resolved: boolean = false;

  /** The object that would have triggered the event handler. */
  get request(): R | undefined {
    return this.#request;
  }

  checkResponse(): boolean {
    const wasResolved = this.#resolved;

    wasResolved || this.#resolve(undefined);

    return wasResolved;
  }

  respondWith(
    /**
     * An object or a Promise that resolves to an object.
     */
    response: T | Promise<T>
  ): void {
    this.#resolve(response);
  }
}

export default RespondableEvent;
