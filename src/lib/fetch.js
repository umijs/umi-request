import 'whatwg-fetch';
import defaultInterceptor from '../defaultInterceptor';

const requestInterceptors = [];
export const responseInterceptors = [];

function fetch(url, options = {}) {
  if (typeof url !== 'string') throw new Error('url MUST be a string');

  const combinedRequestInterceptors = requestInterceptors.concat([defaultInterceptor]);

  return new Promise(resolve => {
    // 执行 request 的拦截器, 处理完以后再去请求
    // 使用 async/await 可以使代码更简洁, 但会 引入 regenerator-runtime 导致体积增加一倍, 所以用 promise
    combinedRequestInterceptors
      .reduce(
        (promise, handler) =>
          promise.then(ret => {
            if (ret) {
              url = ret.url || url;
              options = ret.options || options;
            }
            return handler(url, options);
          }),
        Promise.resolve()
      )
      .then(ret => {
        url = ret.url || url;
        options = ret.options || options;

        // 将 method 改为大写
        options.method = options.method ? options.method.toUpperCase() : 'GET';

        // 请求数据
        let response = window.fetch(url, options);
        // 执行 response 的拦截器
        responseInterceptors.forEach(handler => {
          response = response.then(res => handler(res, options));
        });

        resolve(response);
      });
  });
}

// 支持拦截器，参考 axios 库的写法: https://github.com/axios/axios#interceptors
fetch.interceptors = {
  request: {
    use: handler => {
      requestInterceptors.push(handler);
    },
  },
  response: {
    use: handler => {
      responseInterceptors.push(handler);
    },
  },
};

export default fetch;
