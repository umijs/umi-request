import Onion from './onion';
import { MapCache } from './utils';
import addfixInterceptor from './interceptor/addfix';
import fetchMiddleware from './middleware/fetch';
import parseResponseMiddleware from './middleware/parseResponse';
import simplePost from './middleware/simplePost';
import simpleGet from './middleware/simpleGet';

// 初始化全局和内核中间件
const globalMiddlewares = [simplePost, simpleGet, parseResponseMiddleware];
const coreMiddlewares = [fetchMiddleware];

Onion.globalMiddlewares = globalMiddlewares;
Onion.defaultGlobalMiddlewaresLength = globalMiddlewares.length;
Onion.coreMiddlewares = coreMiddlewares;
Onion.defaultCoreMiddlewaresLength = coreMiddlewares.length;

class Core {
  constructor(initOptions) {
    this.onion = new Onion([]);
    this.fetchIndex = 0; // 【即将废弃】请求中间件位置
    this.mapCache = new MapCache(initOptions);
    this.initOptions = initOptions;
    this.instanceRequestInterceptors = [];
    this.instanceResponseInterceptors = [];
  }
  // 旧版拦截器为共享
  static requestInterceptors = [addfixInterceptor];
  static responseInterceptors = [];

  use(newMiddleware, opt = { global: false, core: false }) {
    this.onion.use(newMiddleware, opt);
    return this;
  }

  // 请求拦截器 默认 { global: true } 兼容旧版本拦截器
  static requestUse(handler, opt = { global: true }) {
    if (typeof handler !== 'function') throw new TypeError('Interceptor must be function!');
    if(opt.global){
      Core.requestInterceptors.push(handler);
    } else {
      this.instanceRequestInterceptors.push(handler);
    }
  }

  // 响应拦截器 默认 { global: true } 兼容旧版本拦截器
  static responseUse(handler, opt = { global: true }) {
    if (typeof handler !== 'function') throw new TypeError('Interceptor must be function!');
    if(opt.global){
      Core.responseInterceptors.push(handler);
    } else {
      this.instanceResponseInterceptors.push(handler);
    }
  }

  // 执行请求前拦截器
  dealRequestInterceptors(ctx) {
    const reducer = (p1, p2) =>
      p1.then((ret = {}) => {
        ctx.req.url = ret.url || ctx.req.url;
        ctx.req.options = ret.options || ctx.req.options;
        return p2(ctx.req.url, ctx.req.options);
      });
    const allInterceptors = [...Core.requestInterceptors, ...this.instanceRequestInterceptors];
    return allInterceptors.reduce(reducer, Promise.resolve()).then((ret = {}) => {
      ctx.req.url = ret.url || ctx.req.url;
      ctx.req.options = ret.options || ctx.req.options;
      return Promise.resolve();
    });
  }

  request(url, options) {
    const { onion } = this;
    const obj = {
      req: { url, options },
      res: null,
      cache: this.mapCache,
      responseInterceptors: [...Core.responseInterceptors, ...this.instanceResponseInterceptors],
    };
    if (typeof url !== 'string') {
      throw new Error('url MUST be a string');
    }

    return new Promise((resolve, reject) => {
      this.dealRequestInterceptors(obj)
        .then(() => onion.execute(obj))
        .then(() => {
          resolve(obj.res);
        })
        .catch(error => {
          const { errorHandler } = obj.req.options;
          if (errorHandler) {
            try {
              const data = errorHandler(error);
              resolve(data);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(error);
          }
        });
    });
  }
}

export default Core;
