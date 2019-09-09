import { stringify } from 'query-string';

// 对请求参数做处理，实现 query 简化、 post 简化
export default function simpleGetMiddleware(ctx, next) {
  if (!ctx) return next();
  const { req: { options = {} } = {} } = ctx;
  let { req: { url = '' } = {} } = ctx;
  // 将 method 改为大写
  options.method = options.method ? options.method.toUpperCase() : 'GET';

  // 支持类似axios 参数自动拼装, 其他method也可用, 不冲突.
  if (options.params && Object.keys(options.params).length > 0) {
    const str = url.indexOf('?') !== -1 ? '&' : '?';
    ctx.req.originUrl = url;
    url = `${url}${str}${stringify(options.params)}`;
    ctx.req.url = url;
  }

  ctx.req.options = options;

  return next();
}
