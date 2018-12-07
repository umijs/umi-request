import fetch from "./lib/fetch";
import { MapCache } from "./utils";
import WrappedFetch from "./wrapped-fetch";
import WrappedRpc from "./wrapped-rpc";

/**
 * 获取request实例 调用参数可以覆盖初始化的参数. 用于一些情况的特殊处理.
 * @param {*} initOptions 初始化参数
 */
const request = (initOptions = {}) => {
  const mapCache = new MapCache(initOptions);
  const instance = (input, options = {}) => {
    options.headers = { ...initOptions.headers, ...options.headers };
    options.params = { ...initOptions.params, ...options.params };
    options = { ...initOptions, ...options };
    const method = options.method || "get";
    options.method = method.toLowerCase();
    if (method === "rpc") {
      // call rpc
      return new WrappedRpc(input, options, mapCache);
    } else {
      // 前缀
      if (options.prefix) {
        input = `${options.prefix}${input}`;
      }
      return new WrappedFetch(input, options, mapCache);
    }
  };

  // 增加语法糖如: request.get request.post
  const methods = ["get", "post", "delete", "put", "rpc"];
  methods.forEach(method => {
    instance[method] = (input, options) =>
      instance(input, { ...options, method });
  });

  // 给request 也增加一个interceptors引用;
  instance.interceptors = fetch.interceptors;

  return instance;
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
export default request();
