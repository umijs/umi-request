# umi-request

网络请求库，基于 fetch 封装, 旨在为开发者提供一个统一的api调用方式, 简化使用, 并提供诸如缓存, 超时, 字符编码处理, 错误处理等常用功能.

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

## TODO 欢迎pr
- [ ] rpc支持
- [x] 测试用例覆盖85%+
- [x] 写文档
- [x] CI集成
- [x] 发布配置
- [x] typescript

## 安装
`npm install umi-request --save`

## request options 参数
| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| method | 请求方式 | string | get , post , put ... | get |
| params | url请求参数 | object | -- | -- |
| charset | 字符集 | string | utf8 , gbk | utf8 |
| requestType | post请求时数据类型 | string | json , form | json |
| data | 提交的数据 | any | -- | -- |
| responseType | 如何解析返回的数据 | string | json , text , blob , formData ... | json , text |
| getResponse | 是否获取源response, 返回结果将包裹一层 | boolean | -- | fasle |
| timeout | 超时时长, 默认毫秒, 写操作慎用  | number | -- | -- |
| useCache | 是否使用缓存 | boolean | -- | false |
| ttl | 缓存时长, 0 为不过期 | number | -- | 60000 |
| prefix | 前缀, 一般用于覆盖统一设置的prefix | string | -- | -- |
| suffix | 后缀, 比如某些场景 api 需要统一加 .json  | string | -- | -- |
| errorHandler | 异常处理, 或者覆盖统一的异常处理 | function(error) | -- |
| headers | fetch 原有参数 | object | -- | {} | 

fetch原其他参数有效, 详见[fetch文档](https://github.github.io/fetch/)

## extend options 初始化默认参数, 支持以上所有
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| maxCache | 最大缓存数 | number | 不限 |
| prefix | 默认url前缀 | string | -- |
| errorHandler | 默认异常处理 | function(error) | -- |
| headers | 默认headers | object | {} |
| params | 默认带上的query参数 | object | {} |
| ... |


## 使用
```javascript
// request 是默认实例可直接使用, extend为可配置方法, 传入一系列默认参数, 返回一个新的request实例, 用法与request一致.
import request, { extend } from 'umi-request';

const extendedRequest = extend({
  maxCache: 10, // 最大缓存个数, 超出后会自动清掉按时间最开始的一个.
  prefix: '/api/v1', // prefix
  suffix: '.json', // suffix
  errorHandler: (error) => {
    // 集中处理错误
  },
  headers: {
    some: 'header'  // 统一的headers
  },
  params: {
    hello: 'world'   // 每个请求都要带上的query参数
  }
});
extendedRequest('/some/api');

// 支持语法糖 如: request.get request.post ...
request.post('/api/v1/some/api', { data: {foo: 'bar'}});

// 请求一个api, 没有method参数默认为get
request('/api/v1/some/api').then(res => {
  console.log(res);
}).catch(err => {
  console.log(err);
});

// url参数序列化
request('/api/v1/some/api', { params: {foo: 'bar'} });

// post 数据提交简化
// 当data为object时, 默认requestType: 'json'可不写, header会自动带上 application/json
request('/api/v1/some/api', { method:'post', data: {foo: 'bar'} });

// requestType: 'form', header会自动带上 application/x-www-form-urlencoded
request('/api/v1/some/api', { method:'post', requestType: 'form', data: {foo: 'bar'} });

// reponseType: 'blob', 如何处理返回的数据, 默认情况下 text 和 json 都不用加. 如blob 或 formData 之类需要加
request('/api/v1/some/api', { reponseType: 'blob' });

// 提交其他数据, 如文本, 上传文件等, requestType不填, 手动添加对应header.
request('/api/v1/some/api', { method:'post', data: 'some data', headers: { 'Content-Type': 'multipart/form-data'} });

// 默认返回的就是数据体, 如果需要源response来扩展, 可用getResponse参数. 返回结果会多套一层
request('/api/v1/some/api', { getResponse: true }).then({data, response} => {
  console.log(data, response);
});

// 超时 单位毫秒, 但是超时后客户端虽然返回超时, 但api请求不会断开, 写操作慎用.
request('/api/v1/some/api', { timeout: 3000 });

// 使用缓存, 只有get时有效. 单位毫秒, 不加ttl默认60s, ttl=0不过期. cache key为url+params组合
request('/api/v1/some/api', { params: { hello: 'world' }, useCache: true, ttl: 10000 });

// 当服务端返回的是gbk时可用这个参数, 避免得到乱码
request('/api/v1/some/api', { charset: 'gbk' });

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
```

## 错误处理
```javascript
import request, { extend } from 'umi-request';
/**
 * 这里介绍四种处理方式
 */
/**
 * 1. 统一处理
 * 常用于错误码较规范的项目中, 集中处理错误.
 */

const codeMap = {
  '021': '发生错误啦',
  '022': '发生大大大大错误啦',
  ...
};

const errorHandler = (error) => {
  const { response, data } = error;
  message.error(codeMap[data.errorCode]);

  throw error;   // 如果throw. 错误将继续抛出. 
  // return {some: 'data'}; 如果return, 将值作为返回. 不写则相当于return undefined, 在处理结果时判断response是否有值即可.
}

const extendRequest = extend({
  prefix: server.url,
  errorHandler
});

const response = await extendRequest('/some/api'); // 将自动处理错误, 不用catch. 如果throw了需要catch.
if (response) {
  // do something
}

/**
* 2. 单独特殊处理
* 如果配置了统一处理, 但某个api需要特殊处理. 则在请求时, 将errorHandler作为参数传入.
*/
const response = await extendRequest('/some/api', {
  method: 'get',
  errorHandler: (error) => {
    // do something
  }
});

/**
 *3. 不配置 errorHandler, 将reponse直接当promise处理, 自己catch.
 */
try {
  const response = await request('/some/api');
} catch (error) {
  // do something
}

/**
*4. 基于response interceptors
*/
request.interceptors.response.use((response) => {
  const codeMaps = {
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
  };
  message.error(codeMaps[response.status]);
  return response;
});

```

## 开发和调试
- npm install
- npm run dev
- npm link
- 然后到你测试的项目中执行 npm link umi-request
- 引入并使用

## 代码贡献者
- @clock157
- @yesmeck
