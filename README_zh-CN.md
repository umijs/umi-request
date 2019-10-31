[English](./README.md) | 简体中文

# umi-request

网络请求库，基于 fetch 封装, 兼具 fetch 与 axios 的特点, 旨在为开发者提供一个统一的api调用方式, 简化使用, 并提供诸如缓存, 超时, 字符编码处理, 错误处理等常用功能.

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/umi-request.svg?style=flat-square
[npm-url]: https://npmjs.org/package/umi-request
[travis-image]: https://img.shields.io/travis/umijs/umi-request.svg?style=flat-square
[travis-url]: https://travis-ci.org/umijs/umi-request.svg?branch=master

--------------------

## 支持的功能

- url 参数自动序列化
- post 数据提交方式简化
- response 返回处理简化
- api 超时支持
- api 请求缓存支持
- 支持处理 gbk
- 类 axios 的 request 和 response 拦截器(interceptors)支持
- 统一的错误处理方式
- 类 koa 洋葱机制的 use 中间件机制支持
- 类 axios 的取消请求
- 支持 node 环境发送 http 请求

## 与 fetch, axios 异同

| 特性       | umi-request    | fetch          | axios          |
| :---------- | :-------------- | :-------------- | :-------------- |
| 实现       | 浏览器原生支持 | 浏览器原生支持 | XMLHttpRequest |
| 大小       | 9k             | 4k (polyfill)  | 14k            |
| query 简化 | ✅              | ❌              | ✅              |
| post 简化  | ✅              | ❌              | ❌              |
| 超时       | ✅              | ❌              | ✅              |
| 缓存       | ✅              | ❌              | ❌              |
| 错误检查   | ✅              | ❌              | ❌              |
| 错误处理   | ✅              | ❌              | ✅              |
| 拦截器     | ✅              | ❌              | ✅              |
| 前缀       | ✅              | ❌              | ❌              |
| 后缀       | ✅              | ❌              | ❌              |
| 处理 gbk   | ✅              | ❌              | ❌              |
| 中间件     | ✅              | ❌              | ❌              |
| 取消请求   | ✅              | ❌              | ✅              |

更多讨论参考[传统 Ajax 已死，Fetch 永生](https://github.com/camsong/blog/issues/2), 如果你有好的建议和需求, 请提 [issue](https://github.com/umijs/umi/issues)

## TODO 欢迎pr

- [x] 测试用例覆盖85%+
- [x] 写文档
- [x] CI集成
- [x] 发布配置
- [x] typescript

## 安装
```
npm install --save umi-request
```

## 快速上手
执行 **GET** 请求

``` javascript
import request from 'umi-request';

request.get('/api/v1/xxx?id=1')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// 也可将 URL 的参数放到 options.params 里
request.get('/api/v1/xxx', {
    params: {
      id: 1
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

执行 **POST** 请求
``` javascript
request.post('/api/v1/user', {
    data: {
      name: 'Mike'
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

## umi-request API

可以通过向 **umi-request** 传参来发起请求

**umi-request(url[, options])**
```javascript
import request from 'umi-request';

request('/api/v1/xxx', {
    method: 'get',
    params: { id: 1 }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

request('/api/v1/user', {
    method: 'post',
    data: {
      name: 'Mike'
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

```

## 请求方法的别名
为了方便起见，为所有支持的请求方法提供了别名, ```method``` 属性不必在配置中指定

**request.get(url[, options])**

**request.post(url[, options])**

**request.delete(url[, options])**

**request.put(url[, options])**

**request.patch(url[, options])**

**request.head(url[, options])**

**request.options(url[, options])**


## 创建实例
有些通用的配置我们不想每个请求里都去添加，那么可以通过 ```extend``` 新建一个 umi-request 实例

**extend([options])**

``` javascript
import { extend } from 'umi-request';

const request = extend({
  prefix: '/api/v1',
  timeout: 1000,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

request.get('/user')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

NodeJS 环境创建实例

```javascript
const umi = require('umi-request');
const extendRequest = umi.extend({ timeout: 10000 })

extendRequest('/api/user')
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```


以下是可用的实例方法，指定的配置将与实例的配置合并。

**request.get(url[, options])**

**request.post(url[, options])**

**request.delete(url[, options])**

**request.put(url[, options])**

**request.patch(url[, options])**

**request.head(url[, options])**

**request.options(url[, options])**


umi-request 可以进行一层简单封装后再使用, 可参考 [antd-pro](https://github.com/umijs/ant-design-pro/blob/master/src/utils/request.js)


## 请求配置

### request options 参数

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| :---  | :---  | :---  | :---  | :---  |
| method | 请求方式 | string | get , post , put ... | get |
| params | url请求参数 | object 或 URLSearchParams 对象 | -- | -- |
| data | 提交的数据 | any | -- | -- |
| headers | fetch 原有参数 | object | -- | {} |
| timeout | 超时时长, 默认毫秒, 写操作慎用  | number | -- | -- |
| prefix | 前缀, 一般用于覆盖统一设置的prefix | string | -- | -- |
| suffix | 后缀, 比如某些场景 api 需要统一加 .json  | string | -- | -- |
| credentials | fetch 请求包含 cookies 信息 | object | -- | credentials: 'same-origin' |
| useCache | 是否使用缓存（仅支持浏览器客户端） | boolean | -- | false |
| ttl | 缓存时长, 0 为不过期 | number | -- | 60000 |
| maxCache | 最大缓存数 | number | -- | 无限 |
| requestType | post请求时数据类型 | string | json , form | json |
| parseResponse | 是否对 response 做处理简化 | boolean | -- | true |
| charset | 字符集 | string | utf8 , gbk | utf8 |
| responseType | 如何解析返回的数据 | string | json , text , blob , formData ... | json , text |
| throwErrIfParseFail | 当 responseType 为 'json', 对请求结果做 JSON.parse 出错时是否抛出异常 | boolean | -- |false |
| getResponse | 是否获取源response, 返回结果将包裹一层 | boolean | -- | fasle |
| errorHandler | 异常处理, 或者覆盖统一的异常处理 | function(error) | -- |
| cancelToken | 取消请求的 Token | CancelToken.token | -- | -- |


fetch原其他参数有效, 详见[fetch文档](https://github.github.io/fetch/)

### extend options 初始化默认参数, 支持以上所有

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| :---  | :---  | :---  | :---  | :---  |
| method | 请求方式 | string | get , post , put ... | get |
| params | url请求参数 | object | -- | -- |
| data | 提交的数据 | any | -- | -- |
| ... |

``` javascript
{
  // 'method' 是创建请求时使用的方法
  method: 'get', // default

  // 'params' 是即将于请求一起发送的 URL 参数，参数会自动 encode 后添加到 URL 中
  // 类型需为 Object 对象或者 URLSearchParams 对象
  params: { id: 1 },

  // 'paramsSerializer' 开发者可通过该函数对 params 做序列化（注意：此时传入的 params 为合并了 extends 中 params 参数的对象，如果传入的是 URLSearchParams 对象会转化为 Object 对象
  paramsSerializer: function (params) {
    return Qs.stringify(params, { arrayFormat: 'brackets' })
  },

  // 'data' 作为请求主体被发送的数据
  // 适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
  // 必须是以下类型之一：
  // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
  // - 浏览器专属：FormData, File, Blob
  // - Node 专属： Stream
  data: { name: 'Mike' },

  // 'headers' 请求头
  headers: { 'Content-Type': 'multipart/form-data' },

  // 'timeout' 指定请求超时的毫秒数（0 表示无超时时间）
  // 如果请求超过了 'timeout' 时间，请求将被中断并抛出请求异常
  timeout: 1000,

  // ’prefix‘ 前缀，统一设置 url 前缀
  // ( e.g. request('/user/save', { prefix: '/api/v1' }) => request('/api/v1/user/save') )
  prefix: '',

  // ’suffix‘ 后缀，统一设置 url 后缀
  // ( e.g. request('/api/v1/user/save', { suffix: '.json'}) => request('/api/v1/user/save.json') )
  suffix: '',

  // 'credentials' 发送带凭据的请求
  // 为了让浏览器发送包含凭据的请求（即使是跨域源），需要设置 credentials: 'include'
  // 如果只想在请求URL与调用脚本位于同一起源处时发送凭据，请添加credentials: 'same-origin'
  // 要改为确保浏览器不在请求中包含凭据，请使用credentials: 'omit'
  credentials: 'same-origin', // default

  // ’useCache‘ 是否使用缓存，当值为 true 时，GET 请求在 ttl 毫秒内将被缓存，缓存策略唯一 key 为 url + params 组合
  useCache: false, // default

  // ’ttl‘ 缓存时长（毫秒）， 0 为不过期
  ttl: 60000,

  // 'maxCache' 最大缓存数， 0 为无限制
  maxCache: 0,

  // 'requestType' 当 data 为对象或者数组时， umi-request 会根据 requestType 动态添加 headers 和设置 body（可传入 headers 覆盖 Accept 和 Content-Type 头部属性）:
  // 1. requestType === 'json' 时, (默认为 json )
  // options.headers = {
  //   Accept: 'application/json',
  //   'Content-Type': 'application/json;charset=UTF-8',
  //   ...options.headers,
  // }
  // options.body = JSON.stringify(data)
  // 2. requestType === 'form' 时，
  // options.headers = {
  //   Accept: 'application/json',
  //   'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  //   ...options.headers,
  // };
  // options.body = query-string.stringify(data);
  // 3. 其他 requestType
  // options.headers = {
  //   Accept: 'application/json',
  //   ...options.headers,
  // };
  // options.body = data;
  requestType: 'json', // default

  // ’parseResponse‘ 是否对请求返回的 Response 对象做格式、状态码解析
  parseResponse: true, // default

  // ’charset‘ 当服务端返回的数据编码类型为 gbk 时可使用该参数，umi-request 会按 gbk 编码做解析，避免得到乱码, 默认为 utf8
  // 当 parseResponse 值为 false 时该参数无效
  charset: 'gbk',

  // 'responseType': 如何解析返回的数据，当 parseResponse 值为 false 时该参数无效
  // 默认为 'json', 对返回结果进行 Response.text().then( d => JSON.parse(d) ) 解析
  // 其他(text, blob, arrayBuffer, formData), 做 Response[responseType]() 解析
  responseType: 'json', // default

  // 'throwErrIfParseFail': 当 responseType 为 json 但 JSON.parse(data) fail 时，是否抛出异常。默认不抛出异常而返回 Response.text() 后的结果，如需要抛出异常，可设置 throwErrIfParseFail 为 true
  throwErrIfParseFail: false, // default

  // 'getResponse': 是否获取源 Response， 返回结果将包含一层： { data, response }
  getResponse: false,// default

  // 'errorHandler' 统一的异常处理，供开发者对请求发生的异常做统一处理，详细使用请参考下方的错误处理文档
  errorHandler: function(error) { /* 异常处理 */ },

  // 'cancelToken' 取消请求的 Token，详细使用请参考下方取消请求文档
  cancelToken: null,
}
```


## 响应结构

某个请求的响应返回的响应对象 Response 如下：
``` javascript
{
  // `data` 由服务器提供的响应, 需要进行解析才能获取
  data: {},

  // `status` 来自服务器响应的 HTTP 状态码
  status: 200,

  // `statusText` 来自服务器响应的 HTTP 状态信息
  statusText: 'OK',

  // `headers` 服务器响应的头
  headers: {},
}
```

当 options.getResponse === false 时, 响应结构为解析后的 data

``` javascript
request.get('/api/v1/xxx', { getResponse: false })
  .then(function(data) {
    console.log(data);
  })
```

当 options.getResponse === true 时，响应结构为包含 data 和 Response 的对象

``` javascript
request.get('/api/v1/xxx', { getResponse: true })
  .then(function({ data, response }) {
    console.log(data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
  })

```

在使用 catch 或者 errorHandler, 响应对象可以通过 ```error``` 对象获取使用，参考**错误处理**这一节文档。


## 错误处理

``` javascript
import request, { extend } from 'umi-request';

const errorHandler = function (error) {
  const codeMap = {
    '021': '发生错误啦',
    '022': '发生大大大大错误啦',
    // ....
  };
  if (error.response) {
    // 请求已发送但服务端返回状态码非 2xx 的响应
    console.log(error.response.status);
    console.log(error.response.headers);
    console.log(error.data);
    console.log(error.request);
    console.log(codeMap[error.data.status])
    
  } else {
    // 请求初始化时出错或者没有响应返回的异常
    console.log(error.message);
  }

  throw error;   // 如果throw. 错误将继续抛出.
  
  // 如果return, 则将值作为返回. 'return;' 相当于return undefined, 在处理结果时判断response是否有值即可.
  // return {some: 'data'}; 
}

// 1. 作为统一错误处理
const extendRequest = extend({ errorHandler });

// 2. 单独特殊处理, 如果配置了统一处理, 但某个api需要特殊处理. 则在请求时, 将errorHandler作为参数传入.
request('/api/v1/xxx', { errorHandler });


// 3. 通过 Promise.catch 做错误处理
request('/api/v1/xxx')
.then(function (response) {
  console.log(response);
})
.catch(function (error) {
  return errorHandler(error);
})

```


## 中间件
类 koa 的洋葱机制，让开发者优雅地做请求前后的增强处理，支持创建实例、全局、内核中间件。

**实例中间件（默认）** ：request.use(fn) 不同实例创建的中间件相互独立不影响;

**全局中间件** : request.use(fn, { global: true }) 全局中间件，不同实例共享全局中间件；

**内核中间件** ：request.use(fn, { core: true }) 内核中间件， 方便开发者拓展请求内核；


request.use(fn[, options])

### 参数
fn 入参
* ctx(Object)：上下文对象，包括req和res对象
* next(Function)：调用下一个中间件的函数

options 参数
* global(boolean): 是否为全局中间件，优先级比 core 高
* core(boolean): 是否为内核中间件

### 例子
1. 同类型中间件执行顺序
``` javascript
import request, { extend } from 'umi-request';
request.use(async (ctx, next) => {
  console.log('a1');
  await next();
  console.log('a2');
})
request.use(async (ctx, next) => {
  console.log('b1');
  await next();
  console.log('b2');
})

const data = await request('/api/v1/a');
```

执行顺序如下：
```
a1 -> b1 -> response -> b2 -> a2
```

2. 不同类型中间件执行顺序
``` javascript
request.use( async (ctx, next) => {
  console.log('instanceA1');
  await next();
  console.log('instanceA2');
})
request.use( async (ctx, next) => {
  console.log('instanceB1');
  await next();
  console.log('instanceB2');
})
request.use( async (ctx, next) => {
  console.log('globalA1');
  await next();
  console.log('globalA2');
}, { global: true })
request.use( async (ctx, next) => {
  console.log('coreA1');
  await next();
  console.log('coreA2');
}, { core: true })
```

执行顺序如下：
```
instanceA1 -> instanceB1 -> globalA1 -> coreA1 -> coreA2 -> globalA2 -> instanceB2 -> instanceA2
```

3. 使用中间件对请求前后做处理
``` javascript
request.use(async (ctx, next) => {
  const { req } = ctx;
  const { url, options } = req;

  // 判断是否需要添加前缀，如果是统一添加可通过 prefix、suffix 参数配置
  if ( url.indexOf('/api') !== 0 ) {
    ctx.req.url = `/api/v1/${url}`;
  }
  ctx.req.options = {
    ...options,
    foo: 'foo'
  };

  await next();

  const { res } = ctx;
  const { success = false } = res; // 假设返回结果为 : { success: false, errorCode: 'B001' }
  if (!success) {
    // 对异常情况做对应处理
  }
})

```

4. 使用内核中间件拓展请求能力
``` javascript

request.use(async (ctx, next) => {
  const { req } = ctx;
  const { url, options } = req;
  const { __umiRequestCoreType__ = 'normal' } = options;
  
  // __umiRequestCoreType__ 用于区分请求内核类型
  // 值为 'normal' 使用 umi-request 内置的请求内核
  if ( __umiRequestCoreType__ === 'normal') {
    await next();
    return;
  }

  // 非 normal 使用自定义请求内核获取响应数据
  const response = getResponseByOtherWay();

  // 将响应数据写入 ctx 中
  ctx.res = response;

  await next();
  return;
}, { core: true });


// 使用自定义请求内核
request('/api/v1/rpc', {
  __umiRequestCoreType__: 'rpc',
  parseResponse: false,
})
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })

```


## 拦截器
在请求或响应被 ```then``` 或 ```catch``` 处理前拦截它们。

``` javascript
// request拦截器, 改变url 或 options.
request.interceptors.request.use((url, options) => {
  return (
    {
      url: `${url}&interceptors=yes`,
      options: { ...options, interceptors: true },
    }
  );
});

// response拦截器, 处理response
request.interceptors.response.use((response, options) => {
  response.headers.append('interceptors', 'yes yo');
  return response;
});

// 提前对响应做异常处理
request.interceptors.response.use((response) => {
  const codeMaps = {
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
  };
  message.error(codeMaps[response.status]);
  return response;
});

// 克隆响应对象做解析处理
request.interceptors.response.use(async (response) => {
  const data = await response.clone().json();
  if(data && data.NOT_LOGIN) {
    location.href = '登录url';
  }
  return response;
})
```

## 取消请求
你可以通过 **cancel token** 来取消一个请求
> cancel token API 是基于已被撤销的 [cancelable-promises 方案](https://github.com/tc39/proposal-cancelable-promises)

1. 你可以通过 **CancelToken.source** 来创建一个 cancel token，如下所示:
```javascript
import Request from 'umi-request';

const CancelToken = Request.CancelToken;
const { token, cancel } = CancelToken.source();
 
Request.get('/api/cancel', {
  cancelToken: token
}).catch(function(thrown) {
  if (Request.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
    // 处理异常
  }
});

Request.post('/api/cancel', {
  name: 'hello world'
}, {
  cancelToken: token
})
 
// 取消请求(参数为非必填)
cancel('Operation canceled by the user.');

```

2. 你也可以通过实例化 CancelToken 来创建一个 token，同时通过传入函数来获取取消方法：
```javascript
import Request from 'umi-request';

const CancelToken = Request.CancelToken;
let cancel;
 
Request.get('/api/cancel', {
  cancelToken: new CancelToken(function executor(c) {
    cancel = c;
  })
});
// 取消请求
cancel();
```

## 案例
### 如何获取响应头信息

通过 **Headers.get()** 获取响应头信息。(可参考 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Headers/get))
``` javascript
request('/api/v1/some/api', { getResponse: true })
.then(({ data, response}) => {
  response.headers.get('Content-Type');
})
```

### 文件上传
使用 FormData() 构造函数时，浏览器会自动识别并添加请求头 ```"Content-Type: multipart/form-data"```, 且参数依旧是表单提交时那种键值对，因此不需要开发者手动设置 **Content-Type**
``` javascript
const formData = new FormData();
formData.append('file', file);
request('/api/v1/some/api', { method:'post', data: formData });
```

如果希望获取自定义头部信息，需要在服务器设置 [Access-Control-Expose-Headers](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Access-Control-Expose-Headers),然后可按照上述方式获取自定义头部信息。

## 开发和调试

- npm install
- npm run dev
- npm link
- 然后到你测试的项目中执行 npm link umi-request
- 引入并使用

## 代码贡献者

- @clock157
- @yesmeck
- @yutingzhao1991
