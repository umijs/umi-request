import Core from './core';
import fetchMiddleware from './middleware/fetch';
import addfixMiddleware from './middleware/addfix';
import parseResponseMiddleware from './middleware/parseResponse';
import simplePost from './middleware/simplePost';
import simpleGet from './middleware/simpleGet';

// 通过 request 函数，在 core 之上再封装一层，提供原 umi/request 一致的 api，无缝升级
const request = (initOptions = {}, middleware = []) => {
  const coreInstance = new Core(initOptions, middleware);
  const umiInstance = (url, options = {}) => {
    const mergeOptions = {
      ...initOptions,
      ...options,
      headers: {
        ...initOptions.headers,
        ...options.headers,
      },
      params: {
        ...initOptions.headers,
        ...options.params,
      },
      method: (options.method || 'get').toLowerCase(),
    };
    return coreInstance.request(url, mergeOptions);
  };

  // 中间件
  umiInstance.use = coreInstance.use.bind(coreInstance);

  // 拦截器
  umiInstance.interceptors = {
    request: {
      use: coreInstance.requestUse.bind(coreInstance),
    },
    response: {
      use: coreInstance.responseUse.bind(coreInstance),
    },
  };

  // 请求语法糖： reguest.get request.post ……
  const METHODS = ['get', 'post', 'delete', 'put', 'rpc', 'patch'];
  METHODS.forEach(method => {
    umiInstance[method] = (url, options) => umiInstance(url, { ...options, method });
  });

  return umiInstance;
};

/**
 * extend 方法参考了ky, 让用户可以定制配置.
 * initOpions 初始化参数
 * @param {number} maxCache 最大缓存数
 * @param {string} prefix url前缀
 * @param {function} errorHandler 统一错误处理方法
 * @param {object} headers 统一的headers
 */
const _extendMiddlewares = [addfixMiddleware, simplePost, simpleGet, fetchMiddleware, parseResponseMiddleware];
export const extend = initOptions => request(initOptions, _extendMiddlewares);

/**
 * 暴露 fetch 中间件，去除响应处理的中间件和前后缀处理的中间件，保障依旧可以使用
 */
const _fetchMiddlewares = [simplePost, simpleGet, fetchMiddleware];
export const fetch = request({}, _fetchMiddlewares);

export default request({}, _extendMiddlewares);
