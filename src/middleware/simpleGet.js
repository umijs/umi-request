import { stringify } from 'query-string';

// 对请求参数做处理，实现 query 简化、 post 简化
export default function simpleGetMiddleware(ctx, next) {
  if (!ctx) return next();
  const { req: { options = {} } = {} } = ctx;
  let { req: { url = '' } = {} } = ctx;
  // 将 method 改为大写
  options.method = options.method ? options.method.toUpperCase() : 'GET';

  // 设置 credentials 默认值为 same-origin，确保当开发者没有设置时，各浏览器对请求是否发送 cookies 保持一致的行为
  // - omit: 从不发送cookies.
  // - same-origin: 只有当URL与响应脚本同源才发送 cookies、 HTTP Basic authentication 等验证信息.(浏览器默认值,在旧版本浏览器，例如safari 11依旧是omit，safari 12已更改)
  // - include: 不论是不是跨域的请求,总是发送请求资源域在本地的 cookies、 HTTP Basic authentication 等验证信息.
  options.credentials = optiosn.credentials || 'same-origin';

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
