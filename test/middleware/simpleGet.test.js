import simpleGet from '../../src/middleware/simpleGet';

const next = () => {};

describe('test simpleGet middleware', () => {
  it('should do nothing when ctx is null', async done => {
    const ctx = null;
    await simpleGet(ctx, next);
    expect(ctx).toBe(null);
    done();
  });
  it('ctx.req.options.url should contain "a=1"', async done => {
    const ctx = {
      req: {
        url: '/api/test',
        options: {
          params: { a: 1 },
        },
      },
    };
    await simpleGet(ctx, next);
    expect(ctx.req.url).toBe('/api/test?a=1');
    done();
  });
  it('ctx.req.options.url should contain "b=2"', async done => {
    const ctx = {
      req: {
        url: '/api/test?a=1',
        options: {
          params: { b: 2 },
        },
      },
    };
    await simpleGet(ctx, next);
    expect(ctx.req.url).toBe('/api/test?a=1&b=2');
    done();
  });
});
