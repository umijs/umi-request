import { stringify } from "query-string";
/**
 * 注册request拦截器
 * get 和 post 参数简化
 * post:
 * @param {json|form} requestType 数据的传输方式, 对应Content-Type, 覆盖常见的两种场景, 自动带上header和格式化数据.
 * @param {object} data 数据字段
 *
 * get:
 * @param {object} params query参数
 */
export default (url, originOptions = {}) => {
  const options = { ...originOptions };
  // 默认get, 兼容method大小写
  let method = options.method || "get";
  method = method.toLowerCase();
  if (method === "post" || method === "put") {
    // requestType 简写默认值为 json
    const { requestType = "json", data } = options;
    // 数据使用类axios的新字段data, 避免引用后影响旧代码, 如将body stringify多次
    if (data) {
      if (Object.prototype.toString.call(data) === "[object Object]") {
        if (requestType === "json") {
          options.headers = {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
            ...options.headers
          };
          options.body = JSON.stringify(data);
        } else if (requestType === "form") {
          options.headers = {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            ...options.headers
          };
          options.body = stringify(data);
        }
      } else {
        // 其他requestType 自定义header
        options.headers = {
          Accept: "application/json",
          ...options.headers
        };
        options.body = data;
      }
    }
  }

  // make sure SOFA response with UTF8: https://lark.alipay.com/zhizheng.ck/me_and_world/rfaldm
  if (url.indexOf("_output_charset") === -1) {
    const str = url.indexOf("?") !== -1 ? "&" : "?";
    url = `${url}${str}_output_charset=utf-8`;
  }
  if (url.indexOf("_input_charset") === -1) {
    url = `${url}&_input_charset=utf-8`;
  }

  // 支持类似axios 参数自动拼装, 其他method也可用, 不冲突.
  if (options.params && Object.keys(options.params).length > 0) {
    url = `${url}&${stringify(options.params)}`;
  }

  return {
    url,
    options
  };
};
