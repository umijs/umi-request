import { safeJsonParse, readerGBK, ResponseError, getEnv, RequestError } from '../utils';

export default function parseResponseMiddleware(ctx, next) {
  let copy;

  return next()
    .then(() => {
      if (!ctx) return;
      const { res = {}, req = {} } = ctx;
      const {
        options: {
          responseType = 'json',
          charset = 'utf8',
          getResponse = false,
          throwErrIfParseFail = false,
          parseResponse = true,
        } = {},
      } = req || {};

      if (!parseResponse) {
        return;
      }

      if (!res || !res.clone) {
        return;
      }

      // 只在浏览器环境对 response 做克隆， node 环境如果对 response 克隆会有问题：https://github.com/bitinn/node-fetch/issues/553
      copy = getEnv() === 'BROWSER' ? res.clone() : res;
      copy.useCache = res.useCache || false;

      // 解析数据
      if (charset === 'gbk') {
        try {
          return res
            .blob()
            .then(readerGBK)
            .then(d => safeJsonParse(d, false, copy, req));
        } catch (e) {
          throw new ResponseError(copy, e.message, null, req, 'ParseError');
        }
      } else if (responseType === 'json') {
        return res.text().then(d => safeJsonParse(d, throwErrIfParseFail, copy, req));
      }
      try {
        // 其他如text, blob, arrayBuffer, formData
        return res[responseType]();
      } catch (e) {
        throw new ResponseError(copy, 'responseType not support', null, req, 'ParseError');
      }
    })
    .then(body => {
      if (!ctx) return;
      const { res = {}, req = {} } = ctx;
      const { options: { getResponse = false } = {} } = req || {};

      if (!copy) {
        return;
      }
      if (copy.status >= 200 && copy.status < 300) {
        // 提供源response, 以便自定义处理
        if (getResponse) {
          ctx.res = { data: body, response: copy };
          return;
        }
        ctx.res = body;
        return;
      }
      throw new ResponseError(copy, 'http error', body, req, 'HttpError');
    })
    .catch(e => {
      if (e instanceof RequestError || e instanceof ResponseError) {
        throw e;
      }
      // 对未知错误进行处理
      const { req, res } = ctx;
      e.request = req;
      e.response = res;
      e.type = e.name;
      e.data = undefined;
      throw e;
    });
}
