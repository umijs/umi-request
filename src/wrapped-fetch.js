import fetch, { responseInterceptors } from './lib/fetch';
import { RequestError, ResponseError, readerGBK, safeJsonParse } from './utils';

export default class WrappedFetch {
  constructor(url, options, cache) {
    this.cache = cache;
    this.url = url;
    this.options = options;
    this._addfix();

    return this._doFetch();
  }

  _addfix() {
    const { prefix, suffix } = this.options;
    // 前缀
    if (prefix) {
      this.url = `${prefix}${this.url}`;
    }
    // 后缀
    if (suffix) {
      this.url = `${this.url}${suffix}`;
    }
  }

  _doFetch() {
    const useCache = this.options.method === 'get' && this.options.useCache;
    if (useCache) {
      let response = this.cache.get({
        url: this.url,
        params: this.options.params,
      });
      if (response) {
        response = response.clone();
        let instance = Promise.resolve(response);
        // cache也应用response拦截器, 感觉可以不要, 因为只缓存状态200状态的数据?
        responseInterceptors.forEach(handler => {
          instance = instance.then(res => handler(res, this.options));
        });
        return this._parseResponse(instance, true);
      }
    }

    let instance = fetch(this.url, this.options);

    // 处理超时
    instance = this._wrappedTimeout(instance);

    // 处理缓存 1.只有get 2.同时参数cache为true 才缓存
    instance = this._wrappedCache(instance, useCache);

    // 返回解析好的数据
    return this._parseResponse(instance);
  }

  /**
   * 处理超时参数 #TODO 超时后连接还在继续
   * Promise.race方式ref: @期贤 http://gitlab.alipay-inc.com/bigfish/bigfish/raw/a2595e1bc52ba624fefe2c98ac54500b8b735835/packages/umi-plugin-bigfish/src/plugins/bigfishSdk/request.js
   * @param {*} instance fetch实例
   */
  _wrappedTimeout(instance) {
    const { timeout } = this.options;
    if (timeout > 0) {
      return Promise.race([
        new Promise((_, reject) =>
          setTimeout(() => reject(new RequestError(`timeout of ${timeout}ms exceeded`)), timeout)
        ),
        instance,
      ]);
    } else {
      return instance;
    }
  }

  /**
   * 处理缓存
   * @param {*} instance fetch实例
   * @param {boolean} useCache 是否缓存
   */
  _wrappedCache(instance, useCache) {
    if (useCache) {
      const { params, ttl } = this.options;
      return instance.then(response => {
        // 只缓存状态码为 200
        if (response.status === 200) {
          const copy = response.clone();
          copy.useCache = true;
          this.cache.set({ url: this.url, params }, copy, ttl);
        }
        return response;
      });
    } else {
      return instance;
    }
  }

  /**
   * 处理返回类型, 并解析数据
   * @param {*} instance fetch实例
   * @param {boolean} useCache 返回类型, 默认json
   */
  _parseResponse(instance, useCache = false) {
    const { responseType = 'json', charset = 'utf8', getResponse = false } = this.options;
    return new Promise((resolve, reject) => {
      let copy;
      instance
        .then(response => {
          copy = response.clone();
          copy.useCache = useCache;
          if (charset === 'gbk') {
            try {
              return response
                .blob()
                .then(blob => readerGBK(blob))
                .then(safeJsonParse);
            } catch (e) {
              throw new ResponseError(copy, e.message);
            }
          } else if (responseType === 'json' || responseType === 'text') {
            return response.text().then(safeJsonParse);
          } else {
            try {
              // 其他如blob, arrayBuffer, formData
              return response[responseType]();
            } catch (e) {
              throw new ResponseError(copy, 'responseType not support');
            }
          }
        })
        .then(data => {
          if (copy.status >= 200 && copy.status < 300) {
            // 提供源response, 以便自定义处理
            if (getResponse) {
              resolve({
                data,
                response: copy,
              });
            } else {
              resolve(data);
            }
          } else {
            throw new ResponseError(copy, 'http error', data);
          }
        })
        .catch(this._handleError.bind(this, { reject, resolve }));
    });
  }

  /**
   * 处理错误
   * @param {*} param0
   * @param {*} error
   */
  _handleError({ reject, resolve }, error) {
    const { errorHandler } = this.options;
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
  }
}
