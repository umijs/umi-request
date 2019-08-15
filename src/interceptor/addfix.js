// 前后缀拦截
const addfix = (url, options = {}) => {
  const { prefix, suffix } = options;
  if (prefix) {
    url = `${prefix}${url}`;
  }
  if (suffix) {
    url = `${url}${suffix}`;
  }
  return {
    url,
    options,
  };
};

export default addfix;
