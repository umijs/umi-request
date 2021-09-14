import simplePost from '../../src/middleware/simplePost';
import querystring from 'query-string';
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
          data: { a: 1, b: [1, 2, 3, 4] },
        },
      },
    };
    await simplePost(ctx, next);
    expect(ctx.req.options.headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    });
    expect(ctx.req.options.body).toBe(querystring.stringify(ctx.req.options.data));
    expect(querystring.stringify(ctx.req.options.data)).toBe('a=1&b=1&b=2&b=3&b=4');
    done();
  });
});
