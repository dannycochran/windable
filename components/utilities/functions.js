/**
 * Debounces a function; courtesy of:
 * https://davidwalsh.name/javascript-debounce-function
 *
 * @param {!Function} func The function to debounce.
 * @param {number=} wait The amount of time to wait before executing func.
 * @param {boolean=} immediate Whether to execute func on the leading side of
 *    the debounce.
 * @return {!Function} A debounced version of the function.
 */
export function debounce(func, wait=100, immediate=false) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

/**
 * Checks if the browser supports canvas.
 */
export function supportsCanvas() {
  return !!document.createElement('canvas').getContext;
}

/**
 * Formats a milliseconds timestamp to YYYYMMDDHH.
 * @param {!Date} date A Date object.
 * @return {string} A string in the format of 'YYYYMMDDHH'.
 */
export function formatTime(date) {
  let month = String(date.getMonth() + 1);
  let day = String(date.getDate());
  let hours = date.getHours();

  // NOAA has data in intervals of 6 hours.
  hours = String((Math.round(hours / 6) * 6) || 0);

  if (month.length === 1) month = '0' + month;
  if (day.length === 1) day = '0' + day;
  if (hours.length === 1) hours = '0' + hours;

  return `${date.getFullYear()}${month}${day}${hours}`;
}
