import createTestServer from 'create-test-server';
import request, { extend, Onion, fetch } from '../src/index';

var Cancel = request.Cancel;
var CancelToken = request.CancelToken;

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('timeout', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  // 测试请求
  describe('test valid fetch', () => {
    it('response should be true', async done => {
      server.get('/test/fetch', (req, res) => {
        setTimeout(() => {
          writeData('ok', res);
        }, 1000);
      });

      let response = await fetch(prefix('/test/fetch'));
      expect(response.ok).toBe(true);
      done();
    });

    it('test fetch interceptors', async done => {
      server.get('/test/interceptors', (req, res) => {
        writeData(req.query, res);
      });
      fetch.interceptors.request.use(() => ({}));
      fetch.interceptors.response.use(res => res);
      fetch.interceptors.request.use((url, options) => {
        return {
          url: `${url}?fetch=fetch`,
          options: { ...options, interceptors: true },
        };
      });
      fetch.interceptors.response.use((res, options) => {
        res.headers.append('interceptors', 'yes yo');
        return res;
      });

      let response = await fetch(prefix('/test/interceptors'));
      expect(response.headers.get('interceptors')).toBe('yes yo');
      const resText = await response.text();
      expect(JSON.parse(resText).fetch).toBe('fetch');

      request.interceptors = fetch.interceptors;
      request.interceptors.request.use((url, options) => {
        return {
          url: `${url}&foo=foo`,
          options,
        };
      });

      response = await request(prefix('/test/interceptors'));
      expect(response.fetch).toBe('fetch');
      expect(response.foo).toBe('foo');
      done();
    });
  });

  describe('test invalid fetch', () => {
    it('test normal and unnormal fetch', async done => {
      expect.assertions(1);
      server.get('/test/fetch', (req, res) => {
        setTimeout(() => {
          writeData('ok', res);
        }, 1000);
      });
      try {
        response = await fetch({ hello: 'hello' });
      } catch (error) {
        expect(error.message).toBe('url MUST be a string');
        done();
      }
    });
  });

  describe('test __umiRequestCoreType__', () => {
    it('should warn when __umiRequestCoreType__ not "normal"', async done => {
      jest.spyOn(console, 'warn');
      process.env.NODE_ENV = 'development';
      expect(console.warn.mock.calls.length).toBe(0);
      await fetch('/api/test', { __umiRequestCoreType__: 'other' });
      expect(console.warn.mock.calls.length).toBe(1);
      expect(console.warn.mock.calls[0][0]).toBe(
        '__umiRequestCoreType__ is a internal property that use in umi-request, change its value would affect the behavior of request! It only use when you want to extend or use request core.'
      );
      process.env.NODE_ENV = 'test';
      done();
    });
  });
});
