// 参考自 puck-core 请求库的插件机制
import compose from './compose';

class Onion {
  constructor(defaultMiddlewares) {
    if (!Array.isArray(defaultMiddlewares)) throw new TypeError('Default middlewares must be an array!');

    this.middlewares = [...defaultMiddlewares];
    this.defaultMiddlewaresLen = defaultMiddlewares.length;
  }

  use(newMiddleware, index = 0) {
    this.middlewares.splice(this.middlewares.length - this.defaultMiddlewaresLen + index, 0, newMiddleware);
  }

  execute(params = null) {
    const fn = compose(this.middlewares);
    return fn(params);
  }
}

export default Onion;
