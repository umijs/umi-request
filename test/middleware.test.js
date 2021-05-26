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

  describe('use defaultInstance middlewares', () => {
    it('default middleware should excute after instance middleware', async done => {
      jest.spyOn(console, 'log');
      process.env.NODE_ENV = 'development';
      const req = extend({});
      server.get('/test/defaultMiddleware', (req, res) => {
        writeData(req.body, res);
      });

      req.use(
        async (ctx, next) => {
          console.log('default a');
          await next();
          console.log('default b');
        },
        { defaultInstance: true }
      );

      req.use(async (ctx, next) => {
        console.log('instance a');
        await next();
        console.log('instance b');
      });
      expect(console.log.mock.calls.length).toBe(0);
      const data = await req(
        prefix('/test/defaultMiddleware', (req, res) => {
          writeData(req.body, res);
        })
      );
      expect(console.log.mock.calls.length).toBe(4);
      expect(console.log.mock.calls[0][0]).toBe('instance a');
      expect(console.log.mock.calls[1][0]).toBe('default a');
      expect(console.log.mock.calls[2][0]).toBe('default b');
      expect(console.log.mock.calls[3][0]).toBe('instance b');
      expect(req.middlewares.defaultInstance.length).toBe(1);
      expect(req.middlewares.instance.length).toBe(1);
      done();
    });
  });

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
      request.use(async (ctx, next) => {
        const { req } = ctx;
        const { url, options } = req;
        const { method } = options;
        if (method.toLowerCase() !== 'rpc') {
          await next();
          return;
        }
        ctx.res = {
          success: true,
          data: 'rpc response',
        };
        await next();
        return;
      }, request.fetchIndex);

      const data = await request('/test/rpc', {
        __umiRequestCoreType__: 'rpc',
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
        __umiRequestCoreType__: 'rpc',
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
