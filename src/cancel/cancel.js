'use strict';

/**
 * 当执行 “取消请求” 操作时会抛出 Cancel 对象作为一场
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

export default Cancel;
