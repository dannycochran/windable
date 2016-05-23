/**
 * Math utilities.
 */

const τ = 2 * Math.PI;
const H = Math.pow(10, -5.2);

/**
 * @param {number} a The numerator.
 * @param {number} n The denominator. 
 * @returns {number} returns remainder of floored division. Useful for
 *    consistent modulo of negative numbers. See:
 *    http://en.wikipedia.org/wiki/Modulo_operation.
 */
const floorMod = function(a, n) {
  return a - n * Math.floor(a / n);
};


/**
 * Returns wind direction and speed in KMPH.
 * @param {!Array<number>} wind A wind vector [u, v, m/s]
 * @return {!Array<number>} Returns [wind direction, KMPH]
 */
const formatVector = function(wind) {
  const d = Math.atan2(-wind[0], -wind[1]) / τ * 360;  // calculate into-the-wind cardinal degrees
  const direction = Math.round((d + 360) % 360 / 5) * 5;  // shift [-180, 180] to [0, 360], and round to nearest 5.
  const kmph = convertMagnitudeToKMPH(wind[2]);
  return [direction, kmph];
};


/**
 * Returns wind speed.
 * @param {!number} magnitude Wind magnitude from u,v,m.
 * @return {!number} The wind speed in kmph.
 */
const convertMagnitudeToKMPH = function(magnitude) {
  return magnitude * 3.6;
};



/**
 * @param {number}
 * @return {number} Radians from degrees.
 */
const deg2rad = function(degrees){
  return (degrees / 180) * Math.PI;
};


/**
 * @param {number}
 * @return {number} Degrees from radians.
 */
const rad2deg = function(radians) {
  return radians / (Math.PI / 180.0);
};


/**
 * Interpolation for vectors like wind (u,v,m/s).
 */
const bilinearInterpolateVector = function(x, y, g00, g10, g01, g11) {
  const rx = (1 - x);
  const ry = (1 - y);
  const a = rx * ry;
  const b = x * ry;
  const c = rx * y;
  const d = x * y;
  const u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
  const v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
  return [u, v, Math.sqrt(u * u + v * v)];
};


const distortion = function(λ, φ, x, y, windy) {
  const hλ = λ < 0 ? H : -H;
  const hφ = φ < 0 ? H : -H;

  const pλ = project(φ, λ + hλ, windy);
  const pφ = project(φ + hφ, λ, windy);

  // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This
  // handles issue where length of 1º λ changes depending on φ. Without this,
  // there is a pinching effect at the poles.
  const k = Math.cos(φ / 360 * τ);

  return [
    (pλ[0] - x) / hλ / k,
    (pλ[1] - y) / hλ / k,
    (pφ[0] - x) / hφ,
    (pφ[1] - y) / hφ
  ];
};


/**
 * @param {number} lat A latitude.
 * @return {number}
 */
const mercY = function(lat) {
  return Math.log(Math.tan(lat / 2 + Math.PI / 4));
};


/**
 * @param {number} lat In radians.
 * @param {number} lon In radians.
 * @return {!Array<number, number>}
 */
const project = function(lat, lon, extent) {
  const ymin = mercY(extent.south);
  const ymax = mercY(extent.north);
  const xFactor = extent.width / (extent.east - extent.west);
  const yFactor = extent.height / (ymax - ymin);

  const y = mercY(math.deg2rad(lat));
  const x = (math.deg2rad(lon) - extent.west) * xFactor;

  return [x, (ymax - y) * yFactor];
};

const invert = function(x, y, extent) {
  const mapLonDelta = extent.east - extent.west;
  const worldMapRadius = extent.width / math.rad2deg(mapLonDelta) * 360/(2 * Math.PI);
  const mapOffsetY = (worldMapRadius / 2 * Math.log( (1 + Math.sin(extent.south)) / (1 - Math.sin(extent.south))));
  const equatorY = extent.height + mapOffsetY;
  const a = (equatorY - y) / worldMapRadius;

  const lat = 180/Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
  const lon = math.rad2deg(extent.west) + x / extent.width * math.rad2deg(mapLonDelta);
  return [lon, lat];
};

export const math = {
  deg2rad: deg2rad,
  bilinearInterpolateVector: bilinearInterpolateVector,
  convertMagnitudeToKMPH: convertMagnitudeToKMPH,
  distortion: distortion,
  floorMod: floorMod,
  formatVector: formatVector,
  invert: invert,
  rad2deg: rad2deg,
};
