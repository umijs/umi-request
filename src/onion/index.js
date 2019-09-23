// 参考自 puck-core 请求库的插件机制
import compose from './compose';

class Onion {
  constructor(defaultMiddlewares) {
    if (!Array.isArray(defaultMiddlewares)) throw new TypeError('Default middlewares must be an array!');

    this.middlewares = [...defaultMiddlewares];
  }

  static globalMiddlewares = []; // 全局中间件
  static defaultGlobalMiddlewaresLength = 0; // 内置全局中间件长度
  static coreMiddlewares = []; // 内核中间件
  static defaultCoreMiddlewaresLength = 0; // 内置内核中间件长度

  use(newMiddleware, opts = { global: false, core: false }) {
    let core = false;
    let global = false;
    if (typeof opts === 'number') {
      if (process && process.env && process.env.NODE_ENV === 'development') {
        console.warn(
          'use() options should be object, number property would be deprecated in future，please update use() options to "{ core: true }".'
        );
      }
      core = true;
      global = false;
    } else if (typeof opts === 'object' && opts) {
      global = opts.global || false;
      core = opts.core || false;
    }

    // 全局中间件
    if (global) {
      Onion.globalMiddlewares.splice(
        Onion.globalMiddlewares.length - Onion.defaultGlobalMiddlewaresLength,
        0,
        newMiddleware
      );
      return;
    }
    // 内核中间件
    if (core) {
      Onion.coreMiddlewares.splice(Onion.coreMiddlewares.length - Onion.defaultCoreMiddlewaresLength, 0, newMiddleware);
      return;
    }

    // 实例中间件
    this.middlewares.push(newMiddleware);
  }

  execute(params = null) {
    const fn = compose([...this.middlewares, ...Onion.globalMiddlewares, ...Onion.coreMiddlewares]);
    return fn(params);
  }
}

export default Onion;
