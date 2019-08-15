English | [简体中文](./README_zh-CN.md)

# umi-request

The network request library, based on fetch encapsulation, combines the features of fetch and axios to provide developers with a unified api call method, simplifying usage, and providing common functions such as caching, timeout, character encoding processing, and error handling.

[![NPM version](https://img.shields.io/npm/v/umi-request.svg?style=flat)](https://npmjs.org/package/umi-request)
[![Build Status](https://img.shields.io/travis/umijs/umi-request.svg?style=flat)](https://travis-ci.org/umijs/umi-request)
[![NPM downloads](http://img.shields.io/npm/dm/umi-request.svg?style=flat)](https://npmjs.org/package/umi-request)

--------------------

## Supported features

- url parameter is automatically serialized
- post data submission method is simplified
- response return processing simplification
- api timeout support
- api request cache support
- support for processing gbk
- request and response interceptor support like axios
- unified error handling
- middleware support
- cancel request support like axios

## umi-request vs fetch vs axios

| Features | umi-request | fetch | axios |
| :---------- | :-------------- | :-------------- | :-------------- |
| implementation | Browser native support | Browser native support | XMLHttpRequest |
| size | 9k | 4k (polyfill) | 14k |
| query simplification | ✅ | ❎ | ✅ |
| post simplification | ✅ | ❎ | ❎ |
| timeout | ✅ | ❎ | ✅ |
| cache | ✅ | ❎ | ❎ |
| error Check | ✅ | ❎ | ❎ |
| error Handling | ✅ | ❎ | ✅ |
| interceptor | ✅ | ❎ | ✅ |
| prefix | ✅ | ❎ | ❎ |
| suffix | ✅ | ❎ | ❎ |
| processing gbk | ✅ | ❎ | ❎ |
| middleware | ✅ | ❎ | ❎ |
| cancel request | ✅ | ❎ | ✅ |

For more discussion, refer to [Traditional Ajax is dead, Fetch eternal life](https://github.com/camsong/blog/issues/2) If you have good suggestions and needs, please mention [issue](https://github.com/umijs/umi/issues)

## TODO Welcome pr

- [ ] rpc support
- [x] Test case coverage 85%+
- [x] write a document
- [x] CI integration
- [x] release configuration
- [x] typescript

## Installation

`npm install umi-request --save`

## request options

| Parameter | Description | Type | Optional Value | Default |
| :--- | :--- | :--- | :--- | :--- |
| method | request method | string | get , post , put ... | get |
| params | url request parameters | object | -- | -- |
| charset | character set | string | utf8 , gbk | utf8 |
| requestType | post request data type | string | json , form | json |
| data | Submitted data | any | -- | -- |
| responseType | How to parse the returned data | string | json , text , blob , formData ... | json , text |
| getResponse | Whether to get the source response, the result will wrap a layer | boolean | -- | fasle |
| timeout | timeout, default millisecond, write with caution | number | -- | -- |
| useCache | Whether to use caching | boolean | -- | false |
| ttl | Cache duration, 0 is not expired | number | -- | 60000 |
| prefix | prefix, generally used to override the uniform settings prefix | string | -- | -- |
| suffix | suffix, such as some scenes api need to be unified .json | string | -- |
| errorHandler | exception handling, or override unified exception handling | function(error) | -- |
| headers | fetch original parameters | object | -- | {} |
| credentials | fetch request with cookies | string | -- | credentials: 'include' |
| parseResponse | response processing simplification | boolean | -- | true |
| throwErrIfParseFail | throw error when JSON parse fail and responseType is 'json' | boolean | -- | false |
| cancelToken | Token to cancel request | CancelToken.token | -- | -- |
| type | request type，type 'normal' would use fetch | string | -- | normal | 


The other parameters of fetch are valid. See [fetch documentation](https://github.github.io/fetch/)

## extend options Initialize default parameters, support all of the above

| Parameter | Description | Type | Default |
| :--- | :--- | :--- | :--- |
| maxCache | Maximum number of caches | number | Any |
| prefix | default url prefix | string | -- |
| errorHandler | default exception handling | function(error) | -- |
| headers | default headers | object | {} |
| params | default with the query parameter | object | {} |
| ... |

## Use

> request can be used in a simple package and can be used with reference to [antd-pro](https://github.com/umijs/ant-design-pro/blob/master/src/utils/request.js)

```javascript
// request is the default instance that can be used directly, extend is a configurable method, passing a series of default parameters, returning a new request instance, usage is consistent with the request.
import { extend } from 'umi-request';

const request = extend({
  maxCache: 10, // The maximum number of caches. When it is exceeded, it will automatically clear the first one according to the time.
  prefix: '/api/v1', // prefix
  suffix: '.json', // suffix
  errorHandler: (error) => {
    // Centralized processing error
  },
  headers: {
    Some: 'header' // unified headers
  },
  params: {
    Hello: 'world' // the query parameter to be included with each request
  }
});
request('/some/api');

// Support syntax sugar such as: request.get request.post ...
request.post('/api/v1/some/api', { data: {foo: 'bar'}});

// request an api, no method parameter defaults to get
request('/api/v1/some/api').then(res => {
  console.log(res);
}).catch(err => {
  console.log(err);
});

// url parameter serialization
request('/api/v1/some/api', { params: {foo: 'bar'} });

// post data submission simplification
// When data is object, the default requestType: 'json' can not write, header will automatically bring application / json
request('/api/v1/some/api', { method:'post', data: {foo: 'bar'} });

// requestType: 'form', header will automatically bring application/x-www-form-urlencoded
request('/api/v1/some/api', { method:'post', requestType: 'form', data: {foo: 'bar'} });

// reponseType: 'blob', how to handle the returned data, by default text and json are not added. Such as blob or formData need to add
request('/api/v1/some/api', { reponseType: 'blob' });

// Submit other data, such as text, requestType is not filled, manually add the corresponding header.
request('/api/v1/some/api', { method:'post', data: 'some data', headers: { 'Content-Type': 'multipart/form-data'} });

// upload file
const formData = new FormData();
formData.append('file', file);
request('/api/v1/some/api', { method:'post', body: formData, requestType: 'form' });

// The default is to return the data body, if you need the source response to expand, you can use the getResponse parameter. The result will be a set of layers
request('/api/v1/some/api', { getResponse: true }).then({data, response} => {
  console.log(data, response);
});

// Timeout in milliseconds, but after the timeout, although the client returns a timeout, but the api request will not be disconnected, the write operation is used with caution.
request('/api/v1/some/api', { timeout: 3000 });

// Use the cache, only valid when get. Units of milliseconds, do not add ttl default 60s, ttl = 0 does not expire. cache key for url + params combination
request('/api/v1/some/api', { params: { hello: 'world' }, useCache: true, ttl: 10000 });

// This parameter can be used when the server returns gbk to avoid garbled characters.
request('/api/v1/some/api', { charset: 'gbk' });

// request interceptor, change url or options.
request.interceptors.request.use((url, options) => {
  return (
    {
      url: `${url}&interceptors=yes`,
      options: { ...options, interceptors: true },
    }
  );
});

// response interceptor, handling response
request.interceptors.response.use((response, options) => {
  response.headers.append('interceptors', 'yes yo');
  return response;
});


// use middleware, handling request and response
request.use(async (ctx, next) => {
  const { req } = ctx;
  const { url, options } = req;
  // add prefix
  ctx.req.url = `/api/v1/${url}`;
  ctx.req.options = {
    ...options,
    foo: 'foo'
  };
  await next();

  const { res } = ctx;
  const { success = false } = res;
  if (!success) {
    // Handle fail request here
  }
})

```

## Error handling

```javascript
import request, { extend } from 'umi-request';
/**
 * Here are four ways to deal with
 */
/**
 * 1. Unified processing
 * Commonly used in projects where the error code is more standardized, and the error is handled centrally.
 */

const codeMap = {
  '021': 'An error has occurred',
  '022': 'It’s a big mistake,'
  ...
};

const errorHandler = (error) => {
  const { response, data } = error;
  message.error(codeMap[data.errorCode]);

  throw error; // If throw. The error will continue to be thrown.
  // return {some: 'data'}; If return, return the value as a return. If you don't write it is equivalent to return undefined, you can judge whether the response has a value when processing the result.
}

const extendRequest = extend({
  prefix: server.url,
  errorHandler
});

const response = await extendRequest('/some/api'); // will automatically handle the error, no catch. If throw needs to catch.
if (response) {
  // do something
}

/**
* 2. Separate special treatment
* If unified processing is configured, but an api needs special handling. When requested, the errorHandler is passed as a parameter.
*/
const response = await extendRequest('/some/api', {
  method: 'get',
  errorHandler: (error) => {
    // do something
  }
});

/**
 * 3. not configure errorHandler, the response will be directly treated as promise, and it will be caught.
 */
try {
  const response = await request('/some/api');
} catch (error) {
  // do something
}

/**
* 4. Based on response interceptors
*/
request.interceptors.response.use((response) => {
  const codeMaps = {
    502: 'Gateway error. ',
    503: 'The service is unavailable, the server is temporarily overloaded or maintained. ',
    504: 'The gateway timed out. ',
  };
  message.error(codeMaps[response.status]);
  return response;
});

/**
* 5. For the status code is actually 200 errors
*/
request.interceptors.response.use(async (response) => {
  const data = await response.clone().json();
  if(data && data.NOT_LOGIN) {
    location.href = 'login url';
  }
  return response;
})
```


## Middleware
request.use(fn)

### params
* ctx(Object)：context, content request and response
* next(Function)：function to call the next middleware

### example
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

order of middlewares be called:
```
a1 -> b1 -> response -> b2 -> a2
```

## Cancel request
1. You can cancel a request using a cancel token.
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
    // handle error
  }
});

Request.post('/api/cancel', {
  name: 'hello world'
}, {
  cancelToken: token
})
 
// cancel request (the message parameter is optional)
cancel('Operation canceled by the user.');
```


2. You can also create a cancel token by passing an executor function to the CancelToken constructor:
```javascript
import Request from 'umi-request';

const CancelToken = Request.CancelToken;
let cancel;
 
Request.get('/api/cancel', {
  cancelToken: new CancelToken(function executor(c) {
    cancel = c;
  })
});
 
// cancel request
cancel();
```

## Development and debugging

- npm install
- npm run dev
- npm link
- Then go to the project you are testing to execute npm link umi-request
- Introduced and used

## Questions & Suggestions

Please open an issue [here](https://github.com/umijs/umi/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

## Code Contributors

- @clock157
- @yesmeck
- @yutingzhao1991

## LICENSE

MIT
