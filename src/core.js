import Onion from './onion/onion';
import { MapCache } from './utils';

// 旧版拦截器为共享
const requestInterceptors = [];
const responseInterceptors = [];

class Core {
  constructor(initOptions, defaultMiddlewares) {
    this.onion = new Onion(defaultMiddlewares);
    this.mapCache = new MapCache(initOptions);
  }

  use(newMiddleware) {
    this.onion.use(newMiddleware);
    return this;
  }

  static requestUse(handler) {
    if (typeof handler !== 'function') throw new TypeError('Interceptor must be function!');
    requestInterceptors.push(handler);
  }

  static responseUse(handler) {
    if (typeof handler !== 'function') throw new TypeError('Interceptor must be function!');
    responseInterceptors.push(handler);
  }

  static beforeRequest(ctx) {
    const reducer = (p1, p2) =>
      p1.then((ret = {}) => {
        ctx.req.url = ret.url || ctx.req.url;
        ctx.req.options = ret.options || ctx.req.options;
        return p2(ctx.req.url, ctx.req.options);
      });
    return requestInterceptors.reduce(reducer, Promise.resolve()).then((ret = {}) => {
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
      responseInterceptors,
    };
    if (typeof url !== 'string') {
      throw new Error('url MUST be a string');
    }

    return new Promise((resolve, reject) => {
      Core.beforeRequest(obj)
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
