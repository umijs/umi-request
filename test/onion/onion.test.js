import { Onion } from '../../src/index';
import compose from '../../src/onion/compose';

describe('compose', () => {
  it('should throw error', async done => {
    expect.assertions(1);
    try {
      compose('');
    } catch (e) {
      expect(e.message).toBe('Middlewares must be an array!');
      done();
    }
  });
});

describe('Onion', () => {
  beforeAll(() => {
    Onion.globalMiddlewares = [];
  });
  it('test constructor', async () => {
    expect.assertions(1);
    try {
      const onion = new Onion();
      onion.use(async () => {});
    } catch (error) {
      expect(error.message).toBe('Default middlewares must be an array!');
    }
  });
  it('middleware should be function', async () => {
    expect.assertions(1);
    try {
      const onion = new Onion([]);
      onion.use('not a function');
      onion.execute();
    } catch (error) {
      expect(error.message).toBe('Middleware must be componsed of function');
    }
  });

  it('multiple next should not be call in a middleware', async () => {
    expect.assertions(1);
    try {
      const onion = new Onion([]);
      onion.use(async (ctx, next) => {
        await next();
        await next();
      });
      await onion.execute();
    } catch (error) {
      expect(error.message).toBe('next() should not be called multiple times in one middleware!');
    }
  });
  it('test middleware of throw error', async () => {
    expect.assertions(1);
    try {
      const onion = new Onion([]);
      onion.use(async (ctx, next) => {
        await next();
      });
      onion.use(async () => {
        throw new Error('error in middleware');
      });
      await onion.execute();
    } catch (error) {
      expect(error.message).toBe('error in middleware');
    }
  });
  it('should warning when options is number', async done => {
    jest.spyOn(console, 'warn');
    process.env.NODE_ENV = 'development';
    const onion = new Onion([]);
    expect(console.warn.mock.calls.length).toBe(0);
    onion.use(async (ctx, next) => {
      await next();
    }, 1);
    expect(console.warn.mock.calls.length).toBe(1);
    expect(console.warn.mock.calls[0][0]).toBe(
      'use() options should be object, number property would be deprecated in future，please update use() options to "{ core: true }".'
    );
    process.env.NODE_ENV = 'test';
    done();
  });

  it('should have 1 global middleware', async done => {
    const onion = new Onion([]);
    onion.use(
      async (ctx, next) => {
        await next();
      },
      { global: true }
    );
    expect(Onion.globalMiddlewares.length).toBe(1);
    done();
  });
});
