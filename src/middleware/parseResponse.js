import { safeJsonParse, readerGBK, ResponseError } from '../utils';

export default function parseResponseMiddleware(ctx, next) {
  const { res, req } = ctx;
  const {
    options: { responseType = 'json', charset = 'utf8', getResponse = false },
  } = req || {};

  if (!res || !res.clone) {
    return next();
  }
  const copy = res.clone();
  copy.useCache = res.useCache || false;

  return next()
    .then(() => {
      // 解析数据
      if (charset === 'gbk') {
        try {
          return res
            .blob()
            .then(readerGBK)
            .then(safeJsonParse);
        } catch (e) {
          throw new ResponseError(copy, e.message);
        }
      } else if (responseType === 'json') {
        return res.text().then(safeJsonParse);
      }
      try {
        // 其他如text, blob, arrayBuffer, formData
        return res[responseType]();
      } catch (e) {
        throw new ResponseError(copy, 'responseType not support');
      }
    })
    .then(body => {
      if (copy.status >= 200 && copy.status < 300) {
        // 提供源response, 以便自定义处理
        if (getResponse) {
          ctx.res = { data: body, response: copy };
          return;
        }
        ctx.res = body;
        return;
      }
      throw new ResponseError(copy, 'http error', body);
    });
}
