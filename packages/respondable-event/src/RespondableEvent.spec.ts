/// <reference types="jest" />

import RespondableEvent from './RespondableEvent';

describe('when respond to dispatchEvent', () => {
  let callbackResolvers: PromiseWithResolvers<void>;
  let callback: jest.MockedFn<() => void>;
  let event: RespondableEvent<string>;
  let onAuthenticate: jest.MockedFn<(event: Event) => void>;
  let target: EventTarget;

  beforeEach(() => {
    callbackResolvers = Promise.withResolvers<void>();
    callback = jest.fn().mockImplementationOnce(() => callbackResolvers.resolve());
    event = new RespondableEvent('authenticate', callback);

    onAuthenticate = jest.fn().mockImplementationOnce(event => {
      expect(event).toBeInstanceOf(RespondableEvent);

      (event as RespondableEvent<string>).respondWith('Hello, World!');
    });

    target = new EventTarget();
    target.addEventListener('authenticate', onAuthenticate);
    target.dispatchEvent(event);
  });

  describe('when checkResponse() is called', () => {
    let checkResponseReturnValue: boolean;

    beforeEach(() => {
      checkResponseReturnValue = event.checkResponse();
    });

    it('should return true', () => expect(checkResponseReturnValue).toBe(true));

    test('callback should have called once', () => expect(callback).toHaveBeenCalledTimes(1));
  });

  describe('callback should have called', () => {
    it('once', () => expect(callback).toHaveBeenCalledTimes(1));
    it('with "Hello, World!"', () => expect(callback).toHaveBeenNthCalledWith(1, 'Hello, World!', event));
  });
});

describe('when respondWith() is called twice', () => {
  let callbackResolvers: PromiseWithResolvers<void>;
  let callback: jest.MockedFn<() => void>;
  let event: RespondableEvent<string>;
  let onAuthenticate: jest.MockedFn<(event: Event) => void>;
  let target: EventTarget;

  beforeEach(() => {
    callbackResolvers = Promise.withResolvers<void>();
    callback = jest.fn().mockImplementationOnce(() => callbackResolvers.resolve());
    event = new RespondableEvent('authenticate', callback);
    onAuthenticate = jest.fn().mockImplementation(event => {
      expect(event).toBeInstanceOf(RespondableEvent);

      try {
        (event as RespondableEvent<string>).respondWith('Hello, World!');
      } catch (error) {
        return error;
      }

      return;
    });

    target = new EventTarget();

    target.addEventListener('authenticate', onAuthenticate);
    target.addEventListener('authenticate', onAuthenticate.bind(undefined));

    target.dispatchEvent(event);
  });

  describe('onAuthenicate should have called', () => {
    it('twice', () => expect(onAuthenticate).toHaveBeenCalledTimes(2));
    it('and thrown on respondWith()', () => {
      expect(onAuthenticate).toHaveNthReturnedWith(2, expect.any(Error));
      expect(onAuthenticate).toHaveNthReturnedWith(
        2,
        expect.objectContaining({ message: 'respondWith() has already been invoked.' })
      );
    });
  });
});

describe('when respondWith() is called before dispatchEvent()', () => {
  let callback: jest.MockedFn<() => void>;
  let callbackResolvers: PromiseWithResolvers<void>;
  let event: RespondableEvent<unknown>;

  beforeEach(() => {
    callbackResolvers = Promise.withResolvers<void>();
    callback = jest.fn().mockImplementationOnce(() => callbackResolvers.resolve());
    event = new RespondableEvent('authenticate', callback);
  });

  it('should throw', () =>
    expect(() => event.respondWith('Hello, World!')).toThrow('respondWith() can only be called after dispatched.'));
});

describe('when respondWith() is not called', () => {
  let callback: jest.MockedFn<() => void>;
  let event: RespondableEvent<unknown>;

  beforeEach(() => {
    callback = jest.fn();

    event = new RespondableEvent('authenticate', callback);

    new EventTarget().dispatchEvent(event);
  });

  describe('when checkResponse() is called', () => {
    let checkResponseReturnValue: boolean;

    beforeEach(() => {
      checkResponseReturnValue = event.checkResponse();
    });

    it('should return false', () => expect(checkResponseReturnValue).toBe(false));

    describe('callback should be called', () => {
      test('once', () => expect(callback).toHaveBeenCalledTimes(1));
      test('with undefined', () => expect(callback).toHaveBeenNthCalledWith(1, undefined, event));
    });
  });
});

describe('when checkResponse() is called before dispatchEvent()', () => {
  it('should throw', () =>
    expect(() => new RespondableEvent('authenticate', () => {}).checkResponse()).toThrow(
      'respondWith() can only be called after dispatched.'
    ));
});

describe('when initialized with request object', () => {
  let event: RespondableEvent<string, number>;

  beforeEach(() => {
    event = new RespondableEvent('authenticate', () => {}, { request: 123 });
  });

  it('should have request property', () => expect(event).toHaveProperty('request', 123));
});
