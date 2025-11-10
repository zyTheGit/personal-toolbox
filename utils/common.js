/**
 * 生成随机数
 * @returns {string} 一个随机数的字符串形式
 */
export function getRandomStr() {
  return Math.random().toString(36).slice(2);
}

/**
 * 防抖
 * @param {Function} fn 需要防抖的函数
 * @param {number} delay 防抖的延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay) {
  let timerId = null;
  /**
   * 防抖后的函数
   * @param {...*} args 需要防抖的函数的参数
   */
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delay);
  };
}

// 节流
export function throttle(fn, gapTime) {
  let _lastTime = 0;
  return function () {
    let _nowTime = +new Date();
    if (_nowTime - _lastTime > gapTime || _lastTime === 0) {
      fn.apply(this, arguments);
      _lastTime = _nowTime;
    }
  };
}
