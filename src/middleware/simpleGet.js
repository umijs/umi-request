import { stringify } from 'qs';
import { isArray, isURLSearchParams, forEach2ObjArr, isObject, isDate } from '../utils';

export function paramsSerialize(params, paramsSerializer) {
  let serializedParams;
  let jsonStringifiedParams;
  // 支持参数自动拼装，其他 method 也可用，不冲突
  if (params) {
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      if (isArray(params)) {
        jsonStringifiedParams = [];
        forEach2ObjArr(params, function(item) {
          if (item === null || typeof item === 'undefined') {
            jsonStringifiedParams.push(item);
          } else {
            jsonStringifiedParams.push(isObject(item) ? JSON.stringify(item) : item);
          }
        });
        // a: [1,2,3] => a=1&a=2&a=3
        serializedParams = stringify(jsonStringifiedParams, { arrayFormat: 'repeat', strictNullHandling: true });
      } else {
        jsonStringifiedParams = {};
        forEach2ObjArr(params, function(value, key) {
          let jsonStringifiedValue = value;
          if (value === null || typeof value === 'undefined') {
            jsonStringifiedParams[key] = value;
          } else if (isDate(value)) {
            jsonStringifiedValue = value.toISOString();
          } else if (isArray(value)) {
            jsonStringifiedValue = value;
          } else if (isObject(value)) {
            jsonStringifiedValue = JSON.stringify(value);
          }
          jsonStringifiedParams[key] = jsonStringifiedValue;
        });
        const tmp = stringify(jsonStringifiedParams, { arrayFormat: 'repeat', strictNullHandling: true });
        serializedParams = tmp;
      }
    }
  }
  return serializedParams;
}

// 对请求参数做处理，实现 query 简化、 post 简化
export default function simpleGetMiddleware(ctx, next) {
  if (!ctx) return next();
  const { req: { options = {} } = {} } = ctx;
  const { paramsSerializer, params } = options;
  let { req: { url = '' } = {} } = ctx;
  // 将 method 改为大写
  options.method = options.method ? options.method.toUpperCase() : 'GET';

  // 设置 credentials 默认值为 same-origin，确保当开发者没有设置时，各浏览器对请求是否发送 cookies 保持一致的行为
  // - omit: 从不发送cookies.
  // - same-origin: 只有当URL与响应脚本同源才发送 cookies、 HTTP Basic authentication 等验证信息.(浏览器默认值,在旧版本浏览器，例如safari 11依旧是omit，safari 12已更改)
  // - include: 不论是不是跨域的请求,总是发送请求资源域在本地的 cookies、 HTTP Basic authentication 等验证信息.
  options.credentials = options.credentials || 'same-origin';

  // 支持类似axios 参数自动拼装, 其他method也可用, 不冲突.
  let serializedParams = paramsSerialize(params, paramsSerializer);
  ctx.req.originUrl = url;
  if (serializedParams) {
    const urlSign = url.indexOf('?') !== -1 ? '&' : '?';
    ctx.req.url = `${url}${urlSign}${serializedParams}`;
  }

  ctx.req.options = options;

  return next();
}
