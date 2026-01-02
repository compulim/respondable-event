import { beforeEach, describe, mock, it, test, type Mock } from 'node:test';
import { expect } from 'expect';
import RespondableEvent from './RespondableEvent.ts';

describe('when respond to dispatchEvent', () => {
  let callbackResolvers: PromiseWithResolvers<void>;
  let callback: Mock<() => void>;
  let event: RespondableEvent<string>;
  let onAuthenticate: Mock<(event: Event) => void>;
  let target: EventTarget;

  beforeEach(() => {
    callbackResolvers = Promise.withResolvers<void>();
    callback = mock.fn();
    callback.mock.mockImplementationOnce(() => {
      callbackResolvers.resolve();
    });
    event = new RespondableEvent('authenticate', callback);

    onAuthenticate = mock.fn();
    onAuthenticate.mock.mockImplementationOnce(event => {
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

    test('callback should have called once', () => expect(callback.mock.callCount()).toBe(1));
  });

  describe('callback should have called', () => {
    it('once', () => expect(callback.mock.callCount()).toBe(1));
    it('with "Hello, World!"', () => expect(callback.mock.calls[0]?.arguments).toEqual(['Hello, World!', event]));
  });
});

describe('when respondWith() is called twice', () => {
  let callbackResolvers: PromiseWithResolvers<void>;
  let callback: Mock<() => void>;
  let event: RespondableEvent<string>;
  let onAuthenticate: Mock<(event: Event) => void>;
  let target: EventTarget;

  beforeEach(() => {
    callbackResolvers = Promise.withResolvers<void>();
    callback = mock.fn();
    callback.mock.mockImplementationOnce(() => callbackResolvers.resolve());
    event = new RespondableEvent('authenticate', callback);
    onAuthenticate = mock.fn();
    onAuthenticate.mock.mockImplementation(event => {
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
    it('twice', () => expect(onAuthenticate.mock.callCount()).toBe(2));
    it('and thrown on respondWith()', () => {
      expect(onAuthenticate.mock.calls[1]?.result).toEqual(expect.any(Error));
      expect(onAuthenticate.mock.calls[1]?.result).toEqual(
        expect.objectContaining({ message: 'respondWith() has already been invoked.' })
      );
    });
  });
});

describe('when respondWith() is called before dispatchEvent()', () => {
  let callback: Mock<() => void>;
  let callbackResolvers: PromiseWithResolvers<void>;
  let event: RespondableEvent<unknown>;

  beforeEach(() => {
    callbackResolvers = Promise.withResolvers<void>();
    callback = mock.fn();
    callback.mock.mockImplementationOnce(() => callbackResolvers.resolve());
    event = new RespondableEvent('authenticate', callback);
  });

  it('should throw', () =>
    expect(() => event.respondWith('Hello, World!')).toThrow('respondWith() can only be called after dispatched.'));
});

describe('when respondWith() is not called', () => {
  let callback: Mock<() => void>;
  let event: RespondableEvent<unknown>;

  beforeEach(() => {
    callback = mock.fn();

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
      test('once', () => expect(callback.mock.callCount()).toBe(1));
      test('with undefined', () => expect(callback.mock.calls[0]?.arguments).toEqual([undefined, event]));
    });

    describe('when checkResponse() is called again', () => {
      let checkResponseAgainReturnValue: boolean;

      beforeEach(() => {
        checkResponseAgainReturnValue = event.checkResponse();
      });

      it('should return true', () => expect(checkResponseAgainReturnValue).toBe(true));

      test('callback should be called once', () => expect(callback.mock.callCount()).toBe(1));
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
