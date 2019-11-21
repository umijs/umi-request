import 'isomorphic-fetch';
import { timeout2Throw, cancel2Throw, getEnv } from '../utils';

// 是否已经警告过
let warnedCoreType = false;

// 默认缓存判断，开放缓存判断给非 get 请求使用
function __defaultValidateCache(url, options) {
  const { method = 'get' } = options;
  return method.toLowerCase() === 'get';
}

export default function fetchMiddleware(ctx, next) {
  if (!ctx) return next();
  const { req: { options = {}, url = '' } = {}, cache, responseInterceptors } = ctx;
  const {
    timeout = 0,
    __umiRequestCoreType__ = 'normal',
    useCache = false,
    method = 'get',
    params,
    ttl,
    validateCache = __defaultValidateCache,
  } = options;

  if (__umiRequestCoreType__ !== 'normal') {
    if (process && process.env && process.env.NODE_ENV === 'development' && warnedCoreType === false) {
      warnedCoreType = true;
      console.warn(
        '__umiRequestCoreType__ is a internal property that use in umi-request, change its value would affect the behavior of request! It only use when you want to extend or use request core.'
      );
    }
    return next();
  }

  const adapter = fetch;

  if (!adapter) {
    throw new Error('Global fetch not exist!');
  }

  // 从缓存池检查是否有缓存数据
  const isBrowser = getEnv() === 'BROWSER';
  const needCache = validateCache(url, options) && useCache && isBrowser;
  if (needCache) {
    let responseCache = cache.get({
      url,
      params,
      method,
    });
    if (responseCache) {
      responseCache = responseCache.clone();
      responseCache.useCache = true;
      ctx.res = responseCache;
      return next();
    }
  }

  let response;
  // 超时处理、取消请求处理
  if (timeout > 0) {
    response = Promise.race([cancel2Throw(options, ctx), adapter(url, options), timeout2Throw(timeout, ctx.req)]);
  } else {
    response = Promise.race([cancel2Throw(options, ctx), adapter(url, options)]);
  }

  // 兼容老版本 response.interceptor
  responseInterceptors.forEach(handler => {
    response = response.then(res => handler(res, options));
  });

  return response.then(res => {
    // 是否存入缓存池
    if (needCache) {
      if (res.status === 200) {
        const copy = res.clone();
        copy.useCache = true;
        cache.set({ url, params, method }, copy, ttl);
      }
    }

    ctx.res = res;
    return next();
  });
}
