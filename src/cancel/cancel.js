'use strict';

/**
 * 当执行 “取消请求” 操作时会抛出 Cancel 对象作为异常
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return this.message ? `Cancel: ${this.message}` : 'Cancel';
};

Cancel.prototype.__CANCEL__ = true;

export default Cancel;
