import 'whatwg-fetch';
import defaultInterceptor from '../defaultInterceptor';

const requestInterceptors = [];
export const responseInterceptors = [];

function fetch(url, options = {}) {
  if (typeof url !== 'string') throw new Error('url MUST be a string');

  // 执行 request 的拦截器
  requestInterceptors.concat([defaultInterceptor]).forEach(handler => {
    const ret = handler(url, options);
    url = ret.url || url;
    options = ret.options || options;
  });

  // 将 method 改为大写
  options.method = options.method ? options.method.toUpperCase() : 'GET';

  // 请求数据
  let response = window.fetch(url, options);
  // 执行 response 的拦截器
  responseInterceptors.forEach(handler => {
    response = response.then(res => handler(res, options));
  });

  return response;
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
