import createTestServer from 'create-test-server';
import request, { extend, Onion, fetch } from '../src/index';

const debug = require('debug')('afx-request:test');

var Cancel = request.Cancel;
var CancelToken = request.CancelToken;

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('interceptor', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  it('valid interceptor', async done => {
    expect.assertions(3);
    server.get('/test/interceptors', (req, res) => {
      writeData(req.query, res);
    });

    // return nothing test
    request.interceptors.request.use(() => ({}));

    // return same thing
    request.interceptors.response.use(res => res);

    // request interceptor of add param to options
    request.interceptors.request.use((url, options) => {
      return {
        url: `${url}?interceptors=yes`,
        options: { ...options, interceptors: true },
      };
    });

    // response interceptor, change response's header
    request.interceptors.response.use((res, options) => {
      res.headers.append('interceptors', 'yes yo');
      return res;
    });

    const response = await request(prefix('/test/interceptors'), {
      timeout: 1200,
      getResponse: true,
    });

    expect(response.data.interceptors).toBe('yes');
    expect(response.response.headers.get('interceptors')).toBe('yes yo');

    // invalid url
    try {
      request({ hello: 1 });
    } catch (error) {
      expect(error.message).toBe('url MUST be a string');
      done();
    }
  });

  it('invalid interceptor constructor', async done => {
    expect.assertions(2);
    try {
      request.interceptors.request.use('invalid interceptor');
    } catch (error) {
      expect(error.message).toBe('Interceptor must be function!');
    }
    try {
      request.interceptors.response.use('invalid interceptor');
    } catch (error) {
      expect(error.message).toBe('Interceptor must be function!');
    }
    done();
  });

  it('use interceptor to modify request data', async done => {
    server.post('/test/post/interceptors', (req, res) => {
      writeData(req.body, res);
    });
    request.interceptors.request.use((url, options) => {
      if (options.method.toLowerCase() === 'post') {
        options.data = {
          ...options.data,
          foo: 'foo',
        };
      }
      return { url, options };
    });

    const data = await request(prefix('/test/post/interceptors'), {
      method: 'post',
      data: { bar: 'bar' },
    });
    expect(data.foo).toBe('foo');
    done();
  });

  // use promise to test
  it('use promise interceptor to modify request data', async done => {
    server.post('/test/promiseInterceptors', (req, res) => {
      writeData(req.body, res);
    });

    request.interceptors.request.use((url, options) => {
      return new Promise(resolve => {
        setTimeout(() => {
          if (options.method.toLowerCase() === 'post') {
            options.data = {
              ...options.data,
              promiseFoo: 'promiseFoo',
            };
          }
          resolve({ url, options });
        }, 1000);
      });
    });

    const data = await request(prefix('/test/promiseInterceptors'), {
      method: 'post',
      data: { bar: 'bar' },
    });
    expect(data.promiseFoo).toBe('promiseFoo');
    done();
  });
});
