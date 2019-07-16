// 返回一个组合了所有插件的“插件”

export default function compose(middlewares) {
  if (!Array.isArray(middlewares)) throw new TypeError('Middlewares must be an array!');

  const middlewaresLen = middlewares.length;
  for (let i = 0; i < middlewaresLen; i++) {
    if (typeof middlewares[i] !== 'function') throw new TypeError('Middleware must be componsed of function');
  }

  return function wrapMiddlewares(params, next) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() should not be called multiple times in one middleware!'));
      }
      index = i;
      const fn = middlewares[i] || next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(params, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}
