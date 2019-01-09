import createTestServer from "create-test-server";
import iconv from "iconv-lite";
import request, { extend } from "../src/index";
import { MapCache } from "../src/utils";
const debug = require("debug")("afx-request:test");

const writeData = (data, res) => {
  res.setHeader("access-control-allow-origin", "*");
  res.send(data);
};

describe("test fetch:", () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  const prefix = api => `${server.url}${api}`;

  // 测试超时
  it("test timeout", async () => {
    server.get("/test/timeout", (req, res) => {
      setTimeout(() => {
        writeData("ok", res);
      }, 1000);
    });

    // 第一次超时前返回
    let response = await request(prefix("/test/timeout"), {
      timeout: 1200,
      getResponse: true
    });
    expect(response.response.ok).toBe(true);

    // 第二次超时异常
    try {
      response = await request(prefix("/test/timeout"), { timeout: 800 });
    } catch (error) {
      expect(error.name).toBe("RequestError");
    }
  }, 5000);

  // 测试请求类型
  it("test requestType", async () => {
    server.post("/test/requestType", (req, res) => {
      writeData(req.body, res);
    });

    let response = await request(prefix("/test/requestType"), {
      method: "post",
      requestType: "form",
      data: {
        hello: "world"
      }
    });
    expect(response.hello).toBe("world");

    response = await request(prefix("/test/requestType"), {
      method: "post",
      requestType: "json",
      data: {
        hello: "world2"
      }
    });
    expect(response.hello).toBe("world2");

    response = await request(prefix("/test/requestType"), {
      method: "post",
      data: "hehe"
    });
    expect(response).toBe("hehe");
  }, 5000);

  // 测试返回类型 #TODO 更多类型
  it("test responseType", async () => {
    server.post("/test/responseType", (req, res) => {
      writeData(req.body, res);
    });
    server.get("/test/responseType", (req, res) => {
      if (req.query.type === "blob") {
        const data = new Blob(["aaaaa"]);
        writeData(data, res);
      } else {
        writeData(req.body, res);
      }
    });

    let response = await request(prefix("/test/responseType"), {
      method: "post",
      responseType: "json",
      data: { a: 11 }
    });
    expect(response.a).toBe(11);

    try {
      response = await request(prefix("/test/responseType"), {
        responseType: "other",
        params: { type: "blob" }
      });
    } catch (error) {
      expect(error.message).toBe("responseType not support");
    }
  }, 5000);

  // 测试拼接参数
  it("test queryParams", async () => {
    server.get("/test/queryParams", (req, res) => {
      writeData(req.query, res);
    });

    let response = await request(prefix("/test/queryParams"), {
      params: {
        hello: "world3",
        wang: "hou"
      }
    });
    expect(response.wang).toBe("hou");
  }, 5000);

  // 测试缓存
  it("test cache", async () => {
    server.get("/test/cache", (req, res) => {
      writeData(req.query, res);
    });
    server.get("/test/cache2", (req, res) => {
      writeData(req.query, res);
    });
    server.get("/test/cache3", (req, res) => {
      writeData(req.query, res);
    });

    const extendRequest = extend({
      maxCache: 2,
      prefix: server.url,
      headers: { Connection: "keep-alive" }
    });

    // 第一次写入缓存
    let response = await extendRequest("/test/cache", {
      params: {
        hello: "world3",
        wang: "hou"
      },
      useCache: true,
      ttl: 5000
    });

    // 第二次读取缓存
    response = await extendRequest("/test/cache", {
      params: {
        hello: "world3",
        wang: "hou"
      },
      useCache: true,
      ttl: 5000,
      getResponse: true
    });

    expect(response.response.useCache).toBe(true);

    // 模拟参数不一致, 读取失败
    response = await extendRequest("/test/cache2", {
      params: {
        hello: "world3",
        wang: "hou"
      },
      useCache: true,
      ttl: 5000,
      getResponse: true
    });

    expect(response.response.useCache).toBe(false);

    // 模拟写入第三次, 第一个将被删掉
    response = await extendRequest("/test/cache3", {
      params: {
        hello: "world3",
        wang: "hou"
      },
      useCache: true,
      ttl: 5000
    });

    // 读取第一个缓存, 将读取失败
    response = await extendRequest("/test/cache", {
      params: {
        hello: "world3",
        wang: "hou"
      },
      useCache: true,
      ttl: 5000,
      getResponse: true
    });

    expect(response.response.useCache).toBe(false);
  }, 10000);

  // 测试异常捕获
  it("test exception", async () => {
    server.get("/test/exception", (req, res) => {
      res.setHeader("access-control-allow-origin", "*");
      res.status(401);
      res.send({ hello: 11 });
    });
    // 测试访问一个不存在的网址
    try {
      let response = await request(prefix("/test/exception"), {
        params: {
          hello: "world3",
          wang: "hou"
        }
      });
    } catch (error) {
      expect(error.name).toBe("ResponseError");
      expect(error.response.status).toBe(401);
    }
  }, 6000);

  // 测试字符集 gbk支持 https://yuque.antfin-inc.com/zhizheng.ck/me_and_world/rfaldm
  it("test charset", async () => {
    server.get("/test/charset", (req, res) => {
      res.setHeader("access-control-allow-origin", "*");
      res.setHeader("Content-Type", "text/html; charset=gbk");
      writeData(iconv.encode("我是乱码?", "gbk"), res);
    });

    let response = await request(prefix("/test/charset"), { charset: "gbk" });
    expect(response).toBe("我是乱码?");
  }, 6000);

  // 测试错误处理方法
  it("test errorHandler", async () => {
    server.get("/test/errorHandler", (req, res) => {
      res.setHeader("access-control-allow-origin", "*");
      res.status(401);
      res.send({ errorCode: "021", errorMsg: "some thing wrong" });
    });

    const codeMap = {
      "021": "发生错误啦",
      "022": "发生大大大大错误啦"
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
      errorHandler
    });

    try {
      let response = await extendRequest.get("/test/errorHandler");
    } catch (error) {
      expect(error).toBe("发生错误啦");
    }

    try {
      let response = await extendRequest.get("/test/errorHandler", {
        errorHandler: error => {
          return "返回数据";
        }
      });
      expect(response).toBe("返回数据");
      response = await extendRequest.get("/test/errorHandler", {
        errorHandler: error => {
          throw "统一错误处理被覆盖啦";
        }
      });
      // throw response;
    } catch (error) {
      expect(error).toBe("统一错误处理被覆盖啦");
    }
  }, 6000);

  it("test prefix and suffix", async () => {
    server.get("/prefix/api/hello", (req, res) => {
      writeData({ success: true }, res);
    });

    server.get("/api/hello.json", (req, res) => {
      writeData({ success: true }, res);
    });

    let response = await request("/hello", {
      prefix: `${server.url}/prefix/api`
    });
    expect(response.success).toBe(true);

    response = await request(prefix("/api/hello"), {
      suffix: ".json",
      params: { hello: "world" }
    });
    expect(response.success).toBe(true);
  });

  it("test array json", async () => {
    server.post("/api/array/json", (req, res) => {
      writeData({ data: req.body }, res);
    });

    let response = await request(prefix("/api/array/json"), {
      method: "post",
      data: ["hello", { world: "one" }]
    });

    expect(response.data[0]).toBe("hello");
    expect(response.data[1].world).toBe("one");
  });

  afterAll(() => {
    server.close();
  });
});

// 测试rpc #TODO
describe("test rpc:", () => {
  it("test hello", () => {
    expect(request.rpc("wang").hello).toBe("wang");
  });
});

// 测试工具函数
describe("test utils:", () => {
  it("test cache:", done => {
    const mapCache = new MapCache({ maxCache: 3 });

    // 设置读取
    const key = { some: "one" };
    mapCache.set(key, { hello: "world1" }, 1000);
    expect(mapCache.get(key).hello).toBe("world1");
    setTimeout(() => {
      expect(mapCache.get(key)).toBe(undefined);
      done();
    }, 1001);

    // 删除
    const key2 = { other: "two" };
    mapCache.set(key2, { hello: "world1" }, 10000);
    mapCache.delete(key2);
    expect(mapCache.get(key2)).toBe(undefined);

    // 清除
    const key3 = { other: "three" };
    mapCache.set(key3, { hello: "world1" }, 10000);
    mapCache.clear();
    expect(mapCache.get(key3)).toBe(undefined);

    // 测试超过最大数
    mapCache.set("max1", { what: "ok" }, 10000);
    mapCache.set("max1", { what: "ok1" }, 10000);
    mapCache.set("max2", { what: "ok2" }, 10000);
    mapCache.set("max3", { what: "ok3" }, 10000);
    expect(mapCache.get("max1").what).toBe("ok1");
    mapCache.set("max4", { what: "ok4" }, 10000);
    expect(mapCache.get("max1")).toBe(undefined);
    mapCache.set("max5", { what: "ok5" });
    mapCache.set("max6", { what: "ok6" }, 0);
  }, 3000);
});

// 测试fetch lib
describe("test fetch lib:", () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  const prefix = api => `${server.url}${api}`;

  it("test interceptors", async () => {
    server.get("/test/interceptors", (req, res) => {
      writeData(req.query, res);
    });

    // 测试啥也不返回
    request.interceptors.request.use(() => {
      return {};
    });

    request.interceptors.response.use(res => {
      return res;
    });

    // request拦截器, 加个参数
    request.interceptors.request.use((url, options) => {
      debug(url, options);
      return {
        url: `${url}?interceptors=yes`,
        options: { ...options, interceptors: true }
      };
    });

    // response拦截器, 修改一个header
    request.interceptors.response.use((res, options) => {
      res.headers.append("interceptors", "yes yo");
      return res;
    });

    let response = await request(prefix("/test/interceptors"), {
      timeout: 1200,
      getResponse: true
    });
    expect(response.data.interceptors).toBe("yes");
    expect(response.response.headers.get("interceptors")).toBe("yes yo");

    // 测试乱写
    try {
      request({ hello: 1 });
    } catch (error) {
      expect(error.message).toBe("url MUST be a string");
    }
  });

  it("modify request data", async () => {
    server.post("/test/post/interceptors", (req, res) => {
      writeData(req.body, res);
    });
    request.interceptors.request.use((url, options) => {
      if (options.method.toLowerCase() === "post") {
        options.data = {
          ...options.data,
          foo: "foo"
        };
      }
      return { url, options };
    });

    let data = await request(prefix("/test/post/interceptors"), {
      method: "post",
      data: { bar: "bar" }
    });
    expect(data.foo).toBe("foo");
  });

  afterAll(() => {
    server.close();
  });
});
