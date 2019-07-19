export default function addfixMiddleware(ctx, next) {
  const {
    req: { options = {}, url = '' },
  } = ctx;
  const { prefix, suffix } = options;
  if (typeof url !== 'string') throw new Error('url MUST be a string');

  if (prefix) {
    ctx.req.url = `${prefix}${url}`;
  }
  if (suffix) {
    ctx.req.url = `${url}${suffix}`;
  }
  return next().then(Promise.resolve());
}
