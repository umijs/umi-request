import createTestServer from 'create-test-server';
import iconv from 'iconv-lite';
import { fetch as whatwgFetch } from 'whatwg-fetch';
import request, { extend, Onion, fetch } from '../src/index';
import { MapCache } from '../src/utils';

const debug = require('debug')('afx-request:test');
const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

// 拓展浏览器请求内核
async function browserFetchMiddleware(ctx, next) {
  const {
    req: { options = {}, url = '' },
  } = ctx;
  const { timeout = 0, __umiRequestCoreType__ = 'normal' } = options;
  if (__umiRequestCoreType__ !== 'browser') return next();
  const res = await whatwgFetch(url, options);
  ctx.res = res;
  return next();
}

describe('test fetch:', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  // 测试请求方法
  it('test methodType', async () => {
    server.get('/test/requestType', (req, res) => {
      writeData(req.query, res);
    });

    let response = await request(prefix('/test/requestType'), {
      method: 'get',
      params: {
        foo: 'foo',
      },
    });
    expect(response.foo).toBe('foo');

    response = await request(prefix('/test/requestType'), {
      method: null,
      params: {
        foo: 'foo',
      },
    });
    expect(response.foo).toBe('foo');

    response = await request(prefix('/test/requestType'));
    expect(response).toStrictEqual({});
  }, 5000);

  // 测试请求类型
  it('test requestType', async done => {
    server.post('/test/requestType', (req, res) => {
      writeData(req.body, res);
    });

    let response = await request(prefix('/test/requestType'), {
      method: 'post',
      requestType: 'json',
    });
    expect(response).toStrictEqual({});

    response = await request(prefix('/test/requestType'), {
      method: 'post',
      requestType: 'form',
      data: {
        hello: 'world',
      },
    });
    expect(response.hello).toBe('world');

    response = await request(prefix('/test/requestType'), {
      method: 'post',
      requestType: 'json',
      data: {
        hello: 'world2',
      },
    });
    expect(response.hello).toBe('world2');

    response = await request(prefix('/test/requestType'), {
      method: 'post',
      data: {},
    });
    expect(response).toEqual({});

    response = await request(prefix('/test/requestType'), {
      method: 'post',
      data: 'hehe',
      __umiRequestCoreType__: 'mini',
    });
    expect(response).toBe(null);
    done();
  });

  // 测试非 web 环境无 fetch 情况

  it('test fetch not exist', async done => {
    expect.assertions(1);
    server.post('/test/requestType', (req, res) => {
      writeData(req.body, res);
    });
    const oldFetch = window.fetch;
    window.fetch = null;
    try {
      let response = await request(prefix('/test/requestType'), {
        method: 'post',
        requestType: 'json',
      });
    } catch (error) {
      expect(error.message).toBe('Global fetch not exist!');
      window.fetch = oldFetch;
      done();
    }
  });

  // 测试返回类型 #TODO 更多类型
  it('test invalid responseType', async () => {
    expect.assertions(2);
    server.post('/test/invalid/response', (req, res) => {
      writeData('hello world', res);
    });
    try {
      let response = await request(prefix('/test/invalid/response'), {
        method: 'post',
        responseType: 'json',
        data: { a: 1 },
        throwErrIfParseFail: true,
      });
    } catch (error) {
      expect(error.message).toBe('JSON.parse fail');
      expect(error.data).toBe('hello world');
    }
  });
  it('test responseType', async done => {
    expect.assertions(5);
    server.post('/test/responseType', (req, res) => {
      writeData(req.body, res);
    });
    server.get('/test/responseType', (req, res) => {
      if (req.query.type === 'blob') {
        const data = new Blob(['aaaaa']);
        writeData(data, res);
      } else {
        writeData(req.body, res);
      }
    });

    const extendRequest = extend({});
    extendRequest.use(browserFetchMiddleware, { core: true });

    let response = await extendRequest(prefix('/test/responseType'), {
      method: 'post',
      responseType: 'json',
      data: { a: 11 },
    });
    expect(response.a).toBe(11);

    response = await extendRequest(prefix('/test/responseType'), {
      method: 'post',
      responseType: 'text',
      data: { a: 12 },
    });
    expect(typeof response === 'string').toBe(true);

    // fetch 从 whatwg-fetch 更换成 isomorphic-fetch，默认导入的是 node-fetch，responseType 不支持 formData、arrayBuffer、blob 等方法
    response = await extendRequest(prefix('/test/responseType'), {
      method: 'post',
      responseType: 'formData',
      data: { a: 13 },
    });
    expect(response instanceof FormData).toBe(true);

    response = await request(prefix('/test/responseType'), {
      method: 'post',
      responseType: 'arrayBuffer',
      data: { a: 14 },
    });
    expect(response instanceof ArrayBuffer).toBe(true);

    try {
      response = await request(prefix('/test/responseType'), {
        responseType: 'other',
        params: { type: 'blob' },
      });
    } catch (error) {
      expect(error.message).toBe('responseType not support');
      done();
    }
  });

  // 测试拼接参数
  it('test queryParams', async () => {
    server.get('/test/queryParams', (req, res) => {
      writeData(req.query, res);
    });

    const response = await request(prefix('/test/queryParams'), {
      params: {
        hello: 'world3',
        wang: 'hou',
      },
    });
    expect(response.wang).toBe('hou');
  }, 5000);

  // 测试缓存
  it('test cache', async () => {
    server.get('/test/cache', (req, res) => {
      writeData(req.query, res);
    });
    server.get('/test/cache2', (req, res) => {
      writeData(req.query, res);
    });
    server.get('/test/cache3', (req, res) => {
      writeData(req.query, res);
    });

    const extendRequest = extend({
      maxCache: 2,
      prefix: server.url,
      headers: { Connection: 'keep-alive' },
      params: { defaultParams: true },
    });

    // 第一次写入缓存
    let response = await extendRequest('/test/cache', {
      params: {
        hello: 'world3',
        wang: 'hou',
      },
      useCache: true,
      ttl: 5000,
    });

    // 第二次读取缓存
    response = await extendRequest('/test/cache', {
      params: {
        hello: 'world3',
        wang: 'hou',
      },
      useCache: true,
      ttl: 5000,
      getResponse: true,
    });

    expect(response.response.useCache).toBe(true);

    // 模拟参数不一致, 读取失败
    response = await extendRequest('/test/cache2', {
      params: {
        hello: 'world3',
        wang: 'hou',
      },
      useCache: true,
      ttl: 5000,
      getResponse: true,
    });

    expect(response.response.useCache).toBe(false);

    // 模拟写入第三次, 第一个将被删掉
    response = await extendRequest('/test/cache3', {
      params: {
        hello: 'world3',
        wang: 'hou',
      },
      useCache: true,
      ttl: 5000,
    });

    // 读取第一个缓存, 将读取失败
    response = await extendRequest('/test/cache', {
      params: {
        hello: 'world3',
        wang: 'hou',
      },
      useCache: true,
      ttl: 5000,
      getResponse: true,
    });

    expect(response.response.useCache).toBe(false);
    expect(response.data.defaultParams).toBe('true');
  }, 10000);

  it('test extends', async () => {
    server.get('/test/method', (req, res) => {
      writeData({ method: req.method }, res);
    });

    server.post('/test/method', (req, res) => {
      writeData({ method: req.method }, res);
    });

    const extendRequest = extend({ method: 'POST' });

    let response = await extendRequest(prefix('/test/method'));
    expect(response.method).toBe('POST');

    const extendRequest2 = extend();
    let response2 = await extendRequest2(prefix('/test/method'));
    expect(response2.method).toBe('GET');
  });
  // 测试异常捕获
  it('test exception', async () => {
    server.get('/test/exception', (req, res) => {
      res.setHeader('access-control-allow-origin', '*');
      res.status(401);
      res.send({ hello: 11 });
    });
    // 测试访问一个不存在的网址
    try {
      const response = await request(prefix('/test/exception'), {
        params: {
          hello: 'world3',
          wang: 'hou',
        },
      });
    } catch (error) {
      expect(error.name).toBe('ResponseError');
      expect(error.response.status).toBe(401);
    }
  }, 6000);

  // 测试字符集 gbk支持 https://yuque.antfin-inc.com/zhizheng.ck/me_and_world/rfaldm
  it('test charset', async done => {
    expect.assertions(1);
    server.get('/test/charset', (req, res) => {
      res.setHeader('access-control-allow-origin', '*');
      res.setHeader('Content-Type', 'text/html; charset=gbk');
      writeData(iconv.encode('我是乱码?', 'gbk'), res);
    });
    // fetch 请求库更换成 isomorphic-fetch 后，默认导入为 node-fetch，response 不支持 blob，通过中间件拓展请求内核来覆盖
    const extendRequest = extend({ __umiRequestCoreType__: 'browser' });
    // extendRequest.use(browserFetchMiddleware, request.fetchIndex);

    const response = await extendRequest(prefix('/test/charset'), { charset: 'gbk' });
    expect(response).toBe('我是乱码?');
    done();
  });

  // 测试错误处理方法
  it('test errorHandler', async done => {
    expect.assertions(3);
    server.get('/test/errorHandler', (req, res) => {
      res.setHeader('access-control-allow-origin', '*');
      res.status(401);
      res.send({ errorCode: '021', errorMsg: 'some thing wrong' });
    });

    const codeMap = {
      '021': '发生错误啦',
      '022': '发生大大大大错误啦',
    };

    const errorHandler = error => {
      const { response, data } = error;
      if (response.status === 401) {
        // message.error(codeMap[data.errorCode]);
        throw codeMap[data.errorCode];
      } else {
        return Promise.reject(error);
      }
    };

    const extendRequest = extend({
      prefix: server.url,
      errorHandler,
    });

    try {
      const response = await extendRequest.get('/test/errorHandler');
    } catch (error) {
      expect(error).toBe('发生错误啦');
    }

    try {
      let response = await extendRequest.get('/test/errorHandler', {
        errorHandler: error => '返回数据',
      });
      expect(response).toBe('返回数据');
      response = await extendRequest.get('/test/errorHandler', {
        errorHandler: error => {
          throw '统一错误处理被覆盖啦';
        },
      });
      // throw response;
    } catch (error) {
      expect(error).toBe('统一错误处理被覆盖啦');
      done();
    }
  });

  it('test prefix and suffix', async () => {
    server.get('/prefix/api/hello', (req, res) => {
      writeData({ success: true }, res);
    });

    server.get('/api/hello.json', (req, res) => {
      writeData({ success: true }, res);
    });

    let response = await request('/hello', {
      prefix: `${server.url}/prefix/api`,
    });
    expect(response.success).toBe(true);

    response = await request(prefix('/api/hello'), {
      suffix: '.json',
      params: { hello: 'world' },
    });
    expect(response.success).toBe(true);
  });

  it('test array json', async () => {
    server.post('/api/array/json', (req, res) => {
      writeData({ data: req.body }, res);
    });

    // server.delete throw error: Cross origin http://localhost forbidden
    server.all('/api/array/json/delete', (req, res) => {
      writeData({ data: req.body }, res);
    });

    let response = await request(prefix('/api/array/json'), {
      method: 'post',
      data: ['hello', { world: 'two' }],
    });

    expect(response.data[0]).toBe('hello');
    expect(response.data[1].world).toBe('two');

    response = await request(prefix('/api/array/json/delete'), {
      method: 'delete',
      data: ['1', '2'],
    });
    expect(response.data[0]).toBe('1');
    expect(response.data[1]).toBe('2');
  });
});

// 测试rpc
xdescribe('test rpc:', () => {
  it('test hello', () => {
    expect(request.rpc('wang').hello).toBe('wang');
  });
});
