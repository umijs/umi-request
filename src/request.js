import Core from './core';
import Cancel from './cancel/cancel';
import CancelToken from './cancel/cancelToken';
import isCancel from './cancel/isCancel';
import Oinon from './onion';
import { getParamObject, mergeRequestOptions } from './utils';

// 通过 request 函数，在 core 之上再封装一层，提供原 umi/request 一致的 api，无缝升级
const request = (initOptions = {}) => {
  const coreInstance = new Core(initOptions);
  const umiInstance = (url, options = {}) => {
    const mergeOptions = mergeRequestOptions(coreInstance.initOptions, options);
    return coreInstance.request(url, mergeOptions);
  };

  // 中间件
  umiInstance.use = coreInstance.use.bind(coreInstance);
  umiInstance.fetchIndex = coreInstance.fetchIndex;

  // 拦截器
  umiInstance.interceptors = {
    request: {
      use: Core.requestUse.bind(coreInstance),
    },
    response: {
      use: Core.responseUse.bind(coreInstance),
    },
  };

  // 请求语法糖： reguest.get request.post ……
  const METHODS = ['get', 'post', 'delete', 'put', 'patch', 'head', 'options', 'rpc'];
  METHODS.forEach(method => {
    umiInstance[method] = (url, options) => umiInstance(url, { ...options, method });
  });

  umiInstance.Cancel = Cancel;
  umiInstance.CancelToken = CancelToken;
  umiInstance.isCancel = isCancel;

  umiInstance.extendOptions = coreInstance.extendOptions.bind(coreInstance);

  // 暴露各个实例的中间件，供开发者自由组合
  umiInstance.middlewares = {
    instance: coreInstance.onion.middlewares,
    defaultInstance: coreInstance.onion.defaultMiddlewares,
    global: Oinon.globalMiddlewares,
    core: Oinon.coreMiddlewares,
  };

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
export const extend = initOptions => request(initOptions);

/**
 * 暴露 fetch 中间件，保障依旧可以使用
 */
export const fetch = request({ parseResponse: false });

export default request({});
