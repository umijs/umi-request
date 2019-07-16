import Core from './core';
// 通过 request 函数，在 core 之上再封装一层，提供原 umi/request 一致的 api，无缝升级

const request = (initOptions = {}) => {
  const coreInstance = new Core(initOptions);
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
  const METHODS = ['get', 'post', 'put', 'rpc', 'patch'];
  METHODS.forEach(method => {
    umiInstance[method] = (url, options) => umiInstance(url, { ...options, method });
  });

  return umiInstance;
};

export const extend = initOptions => request(initOptions);
export default request();
