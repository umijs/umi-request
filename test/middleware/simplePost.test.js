import simplePost from '../../src/middleware/simplePost';

const next = () => {};

describe('test simplePost middleware', () => {
  it('should do nothing when ctx is null', async done => {
    const ctx = null;
    await simplePost(ctx, next);
    expect(ctx).toBe(null);
    done();
  });
  it('should has form header when requestType is form', async done => {
    const ctx = {
      req: {
        url: '/api/test',
        options: {
          method: 'post',
          requestType: 'form',
          data: { a: 1 },
        },
      },
    };
    await simplePost(ctx, next);
    expect(ctx.req.options.headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    });
    done();
  });
});
