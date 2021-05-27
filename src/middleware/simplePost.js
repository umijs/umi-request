import { reqStringify, isFormData } from '../utils';

// 对请求参数做处理，实现 query 简化、 post 简化
export default function simplePostMiddleware(ctx, next) {
  if (!ctx) return next();
  const { req: { options = {} } = {} } = ctx;
  const { method = 'get' } = options;

  if (['post', 'put', 'patch', 'delete'].indexOf(method.toLowerCase()) === -1) {
    return next();
  }

  const { requestType = 'json', data } = options;
  // 数据使用类axios的新字段data, 避免引用后影响旧代码, 如将body stringify多次
  if (data) {
    const dataType = Object.prototype.toString.call(data);
    if (dataType === '[object Object]' || dataType === '[object Array]') {
      if (requestType === 'json') {
        options.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          ...options.headers,
        };
        options.body = JSON.stringify(data);
      } else if (requestType === 'form') {
        options.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          ...options.headers,
        };
        options.body = reqStringify(data, { arrayFormat: 'repeat', strictNullHandling: true });
      }
    } else {
      // 其他 requestType 自定义header
      options.headers = {
        Accept: 'application/json',
        ...options.headers,
      };
      options.body = data;
    }
  }

  if (isFormData(options.body)) {
    delete options.headers['Content-Type'];
  }
  ctx.req.options = options;

  return next();
}
