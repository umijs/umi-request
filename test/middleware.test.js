import createTestServer from 'create-test-server';
import request, { extend, Onion, fetch } from '../src/index';

const debug = require('debug')('afx-request:test');

var Cancel = request.Cancel;
var CancelToken = request.CancelToken;

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('middleware', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  describe('use middleware to modify request data and response data', () => {
    it('response should be { hello: "hello", foo: "foo" }', async done => {
      server.post('/test/promiseInterceptors/a/b', (req, res) => {
        writeData(req.body, res);
      });
      request.use(async (ctx, next) => {
        ctx.req.options = {
          ...ctx.req.options,
          data: {
            ...ctx.req.options.data,
            foo: 'foo',
          },
        };
        await next();
      });
      request.use(async (ctx, next) => {
        await next();
        ctx.res.hello = 'hello';
      });
      const data = await request(prefix('/test/promiseInterceptors/a/b'), {
        method: 'post',
        data: {},
      });

      // expect(data.foo).toBe('foo');
      // expect(data.hello).toBe('hello');
      expect(data).toEqual({
        foo: 'foo',
        hello: 'hello',
      });
      done();
    });
  });
});
