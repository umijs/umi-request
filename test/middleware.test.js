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
      expect(data).toEqual({
        foo: 'foo',
        hello: 'hello',
      });
      done();
    });

    it('response should be { hello: "hello", foo: "foo" }', async done => {
      server.post('/test/promiseInterceptors/a/b', (req, res) => {
        writeData(req.body, res);
      });
      const data = await request(prefix('/test/promiseInterceptors/a/b'), {
        method: 'post',
        data: {},
      });
      expect(data).toEqual({
        foo: 'foo',
        hello: 'hello',
      });
      done();
    });
  });
  describe('add request middleware', () => {
    it('it should support rpc request', async done => {
      server.post('/test/rpc', (req, res) => {
        writeData(req.body, res);
      });
      request.use((ctx, next) => {
        const { req } = ctx;
        const { url, options } = req;
        const { method } = options;
        if (method.toLowerCase() !== 'rpc') {
          return next();
        }
        ctx.res = {
          success: true,
          data: 'rpc response',
        };
        return next();
      }, request.fetchIndex);

      const data = await request('/test/rpc', {
        type: 'rpc',
        method: 'rpc',
        parseResponse: false,
      });
      expect(data.data).toEqual('rpc response');
      done();
    });
  });

  describe('request several at same time', () => {
    it('it should response all ok', done => {
      expect.assertions(2);

      server.post('/test/serveral', (req, res) => {
        writeData(req.body, res);
      });

      const r1 = request(prefix('/test/serveral'), {
        method: 'post',
        data: {
          r1: 'r1',
        },
      });

      const r2 = request('/test/rpc', {
        type: 'rpc',
        method: 'rpc',
        parseResponse: false,
      });

      return Promise.all([r1, r2]).then(([ret1, ret2]) => {
        expect(ret1.r1).toBe('r1');
        expect(ret2.data).toBe('rpc response');
        done();
      });
    });
  });
});
