(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _wind = require('./wind/wind');

window.WindMap = _wind.WindMap;

},{"./wind/wind":7}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var canvas = exports.canvas = {
  prepare: function prepare(context, particleWidth, particleFadeOpacity) {
    context.lineWidth = particleWidth;
    context.fillStyle = "rgba(0, 0, 0, " + particleFadeOpacity + ")";
  },

  draw: function draw(buckets, bounds, context, colorScheme) {
    // Fade existing particle trails.
    var prev = context.globalCompositeOperation;
    context.globalCompositeOperation = "destination-in";
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.globalCompositeOperation = prev;

    // Draw new particle trails.
    buckets.forEach(function (bucket, i) {
      if (bucket.length > 0) {
        context.beginPath();
        context.strokeStyle = colorScheme[i];

        bucket.forEach(function (particle) {
          context.moveTo(particle.x, particle.y);
          context.lineTo(particle.xt, particle.yt);
          particle.x = particle.xt;
          particle.y = particle.yt;
        });

        context.stroke();
      }
    });
  },

  clear: function clear(context, bounds) {
    context.clearRect(0, 0, bounds.width, bounds.height);

    if (context.resetTransform) {
      context.resetTransform();
    } else {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
};

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var webGL = exports.webGL = {
  isWebGL: true,
  draw: function draw() {},
  clear: function clear() {}
};

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debounce = debounce;
exports.formatTime = formatTime;
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
function debounce(func) {
  var wait = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];
  var immediate = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  var timeout = void 0;
  return function () {
    var context = this;
    var args = arguments;
    var later = function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

/**
 * Formats a milliseconds timestamp to YYYYMMDDHH.
 * @param {!Date} date A Date object.
 * @return {string} A string in the format of 'YYYYMMDDHH'.
 */
function formatTime(date) {
  var month = String(date.getMonth() + 1);
  var day = String(date.getDate());
  var hours = date.getHours();

  // NOAA has data in intervals of 6 hours.
  hours = String(Math.round(hours / 6) * 6 || 0);

  if (month.length === 1) month = '0' + month;
  if (day.length === 1) day = '0' + day;
  if (hours.length === 1) hours = '0' + hours;

  return '' + date.getFullYear() + month + day + hours;
}

/**
 * Browser shim for getting the requestAnimationFrame function.
 */
var getAnimationFrame = exports.getAnimationFrame = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 20);
  };
}();

/**
 * @param {*} val Any value.
 * @returns {boolean} Whether val is neither null nor undefined.
 */
var isValue = exports.isValue = function isValue(val) {
  return val !== null && val !== undefined;
};

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Math utilities.
 */

var τ = 2 * Math.PI;
var H = Math.pow(10, -5.2);

/**
 * @param {number} a The numerator.
 * @param {number} n The denominator. 
 * @returns {number} returns remainder of floored division. Useful for
 *    consistent modulo of negative numbers. See:
 *    http://en.wikipedia.org/wiki/Modulo_operation.
 */
var floorMod = function floorMod(a, n) {
  return a - n * Math.floor(a / n);
};

/**
 * @param {number}
 * @return {number} Radians from degrees.
 */
var deg2rad = function deg2rad(degrees) {
  return degrees / 180 * Math.PI;
};

/**
 * @param {number}
 * @return {number} Degrees from radians.
 */
var rad2deg = function rad2deg(radians) {
  return radians / (Math.PI / 180.0);
};

/**
 * Interpolation for vectors like wind (u,v,m).
 */
var bilinearInterpolateVector = function bilinearInterpolateVector(x, y, g00, g10, g01, g11) {
  var rx = 1 - x;
  var ry = 1 - y;
  var a = rx * ry;
  var b = x * ry;
  var c = rx * y;
  var d = x * y;
  var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
  var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
  return [u, v, Math.sqrt(u * u + v * v)];
};

var distortion = function distortion(λ, φ, x, y, windy) {
  var hλ = λ < 0 ? H : -H;
  var hφ = φ < 0 ? H : -H;

  var pλ = project(φ, λ + hλ, windy);
  var pφ = project(φ + hφ, λ, windy);

  // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This
  // handles issue where length of 1º λ changes depending on φ. Without this,
  // there is a pinching effect at the poles.
  var k = Math.cos(φ / 360 * τ);

  return [(pλ[0] - x) / hλ / k, (pλ[1] - y) / hλ / k, (pφ[0] - x) / hφ, (pφ[1] - y) / hφ];
};

/**
 * @param {number} lat A latitude.
 * @return {number}
 */
var mercY = function mercY(lat) {
  return Math.log(Math.tan(lat / 2 + Math.PI / 4));
};

/**
 * @param {number} lat In radians.
 * @param {number} lon In radians.
 * @return {!Array<number, number>}
 */
var project = function project(lat, lon, extent) {
  var ymin = mercY(extent.south);
  var ymax = mercY(extent.north);
  var xFactor = extent.width / (extent.east - extent.west);
  var yFactor = extent.height / (ymax - ymin);

  var y = mercY(math.deg2rad(lat));
  var x = (math.deg2rad(lon) - extent.west) * xFactor;

  return [x, (ymax - y) * yFactor];
};

var invert = function invert(x, y, extent) {
  var mapLonDelta = extent.east - extent.west;
  var worldMapRadius = extent.width / math.rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
  var mapOffsetY = worldMapRadius / 2 * Math.log((1 + Math.sin(extent.south)) / (1 - Math.sin(extent.south)));
  var equatorY = extent.height + mapOffsetY;
  var a = (equatorY - y) / worldMapRadius;

  var lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
  var lon = math.rad2deg(extent.west) + x / extent.width * math.rad2deg(mapLonDelta);
  return [lon, lat];
};

var math = exports.math = {
  deg2rad: deg2rad,
  bilinearInterpolateVector: bilinearInterpolateVector,
  distortion: distortion,
  floorMod: floorMod,
  invert: invert,
  rad2deg: rad2deg
};

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
//https://bl.ocks.org/mbostock/5577023

var palettes = exports.palettes = {
  YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
  YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
  GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
  BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
  PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
  PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
  BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
  RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
  PuRed: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
  OrRed: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
  YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
  YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
  Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
  Blues: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
  Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
  Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
  Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
  Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000']
};

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WindMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * A light controller class for using a modified version of Esri's Windy.JS.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _functions = require('../utilities/functions');

var _palettes = require('../utilities/palettes');

var _windy = require('./windy');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WindMap = exports.WindMap = function () {
  /**
   * A constructor for the WindMap. See typedefs.js for a description of
   * ConfigPayload.
   *
   * @param {!ConfigPayload} config An instance of ConfigPayload.
   */

  function WindMap(config) {
    var _this = this;

    _classCallCheck(this, WindMap);

    if (!(0, _windy.getContext)(config.canvas)) {
      throw new Error('Browser does not support canvas.');
    }

    // Required configuration fields.
    this.config_ = {
      canvas: config.canvas,
      extent: config.extent,
      data: config.data,
      colorScheme: config.colorScheme || _palettes.palettes.Purples
    };

    this.palettes = _palettes.palettes;
    this.windy_ = new _windy.Windy({ canvas: config.canvas });
    this.startWindy_ = (0, _functions.debounce)(function () {
      _this.windy_.start(_this.config_);
    });

    this.update(config);
  }

  _createClass(WindMap, [{
    key: 'stop',
    value: function stop() {
      this.windy_.stop();
      return this;
    }
  }, {
    key: 'start',
    value: function start() {
      this.startWindy_();
      return this;
    }

    /**
     * Update the WindMap data and its optional configurations.
     * @param {!Object} config Extends the existing ConfigPayload for this class.
     * @return {!WindMap} The windmap instance.
     */

  }, {
    key: 'update',
    value: function update() {
      var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.stop();

      // Optional configuration fields. These all have default values in Windy.
      Object.assign(this.config_, {
        colorScheme: config.colorScheme || this.config_.colorScheme,
        velocityScale: config.velocityScale || this.config_.velocityScale,
        particleWidth: config.particleWidth || this.config_.particleWidth,
        particleFadeOpacity: config.particleFadeOpacity || this.config_.particleFadeOpacity,
        particleReduction: config.particleReduction || this.config_.particleReduction
      });

      // Update the wind data if it exists.
      this.config_.data = config.data || this.config_.data;

      return this.start();
    }
  }]);

  return WindMap;
}();

},{"../utilities/functions":4,"../utilities/palettes":6,"./windy":8}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Windy = undefined;
exports.getContext = getContext;

var _functions = require('../utilities/functions');

var _math = require('../utilities/math');

var _gl = require('../renderers/gl');

var _canvas = require('../renderers/canvas');

/**
 * A modified version of Esri's Windy.JS, which itself draws heavily from
 * Earth.nullschool's original implementation. Much of the logic from
 * those original libraries is untouched; the updates are mostly aesthetic.
 *
 * https://github.com/Esri/wind-js (MIT License)
 * https://github.com/cambecc/earth (MIT License)
 */

var Windy = exports.Windy = function Windy(windyConfig) {
  // Wind velocity at which particle intensity is maximum (m/s).
  var MAX_WIND_INTENSITY = 30;

  // Max number of frames a particle is drawn before regeneration.
  var MAX_PARTICLE_AGE = 100;

  // Singleton for no wind in the form: [u, v, magnitude].
  var NULL_WIND_VECTOR = [NaN, NaN, null];

  // Color scheme can be defined by user.
  var colorScheme = [];

  // The lower this is, the faster the particles disappear from the screen.
  var particleFadeOpacity = 0.97;

  // Scale for wind velocity (Arbitrary; smaller values reduce velocity).
  var velocityScale = 1 / 200000;

  // Line width of a drawn particle.
  var particleWidth = 2;

  // Reduce particle count to this fraction (improves FPS).
  var particleReduction = 0.1;

  // The context to be used for the canvas.
  var context = getContext(windyConfig.canvas);

  /**
   * Constructs an NX by NY grid (360 by 181 in most cases). Each grid square
   * is 1x1.
   * 
   * @param {!WindData} windData An instance of WindData.
   * @return {!Function} A function to interpolate the wind points on the grid.
   */
  var buildGrid = function buildGrid(windData) {
    var uComp = windData[0];
    var vComp = windData[1];

    // Returns an x,y coordinate pair from uComp and vComp.
    var getDataPoint = function getDataPoint(i) {
      return [uComp.data[i], vComp.data[i]];
    };

    // The grid's origin (e.g., 0.0E, 90.0N)
    var λ0 = uComp.header.lo1;
    var φ0 = uComp.header.la1;

    // Distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat).
    var Δλ = uComp.header.dx;
    var Δφ = uComp.header.dy;

    // Number of grid points W-E and N-S (e.g., 144 x 73).
    var ni = uComp.header.nx;
    var nj = uComp.header.ny;

    // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases
    // from φ0:
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    var grid = [];
    var isContinuous = Math.floor(ni * Δλ) >= 360;
    var p = 0;

    for (var j = 0; j < nj; j++) {
      var row = [];
      for (var i = 0; i < ni; i++, p++) {
        row[i] = getDataPoint(p);
      }

      // For wrapped grids, duplicate first column as last column to simplify
      // interpolation logic.
      if (isContinuous) {
        row.push(row[0]);
      }

      grid[j] = row;
    }

    return function (λ, φ) {
      // Calculate longitude index in wrapped range [0, 360).
      var i = _math.math.floorMod(λ - λ0, 360) / Δλ;

      // Calculate latitude index in direction +90 to -90.
      var j = (φ0 - φ) / Δφ;
      var fi = Math.floor(i);
      var ci = fi + 1;
      var fj = Math.floor(j);
      var cj = fj + 1;

      var row = void 0;
      if (row = grid[fj]) {
        var g00 = row[fi];
        var g10 = row[ci];
        if ((0, _functions.isValue)(g00) && (0, _functions.isValue)(g10) && (row = grid[cj])) {
          var g01 = row[fi];
          var g11 = row[ci];
          if ((0, _functions.isValue)(g01) && (0, _functions.isValue)(g11)) {
            // All four points found, so interpolate the value.
            return _math.math.bilinearInterpolateVector(i - fi, j - fj, g00, g10, g01, g11);
          }
        }
      }
      return null;
    };
  };

  /**
   * Calculate distortion of the wind vector caused by the shape of the
   * projection at point (x, y). The wind vector is modified in place and
   * returned by this function.
   */
  var distort = function distort(λ, φ, x, y, scale, wind, windy) {
    var u = wind[0] * scale;
    var v = wind[1] * scale;
    var d = _math.math.distortion(λ, φ, x, y, windy);

    // Scale distortion vectors by u and v, then add.
    wind[0] = d[0] * u + d[2] * v;
    wind[1] = d[1] * u + d[3] * v;

    return wind;
  };

  var createField = function createField(columns, bounds) {
    /**
     * @returns {Array} wind vector [u, v, magnitude] at the point (x, y).
     */
    function field(x, y) {
      var column = columns[Math.round(x)];
      return column && column[Math.round(y)] || NULL_WIND_VECTOR;
    }

    // Frees the massive "columns" array for GC. Without this, the array is
    // leaked (in Chrome) each time a new field is interpolated because the
    // field closure's context is leaked, for reasons that defy explanation.
    field.release = function () {
      columns = [];
    };

    // UNDONE: this method is terrible
    field.randomize = function (particle) {
      return Object.assign(particle, {
        x: Math.round(Math.floor(Math.random() * bounds.width) + bounds.x),
        y: Math.round(Math.floor(Math.random() * bounds.height) + bounds.y)
      });
    };

    return field;
  };

  var buildBounds = function buildBounds(bounds, width, height) {
    var upperLeft = bounds[0];
    var lowerRight = bounds[1];
    var x = Math.round(upperLeft[0]);
    var y = Math.max(Math.floor(upperLeft[1], 0), 0);
    var xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
    var yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
    return { x: x, y: y, xMax: width, yMax: yMax, width: width, height: height };
  };

  var interpolateField = function interpolateField(grid, bounds, extent) {
    var velocity = bounds.height * velocityScale;

    var x = bounds.x;
    var columns = [];

    function interpolateColumn(x) {
      var column = [];
      for (var y = bounds.y; y <= bounds.yMax; y += 2) {
        var coord = _math.math.invert(x, y, extent);

        if (coord) {
          var λ = coord[0];
          var φ = coord[1];

          if (isFinite(λ)) {
            var wind = grid(λ, φ);

            if (wind) {
              wind = distort(λ, φ, x, y, velocity, wind, extent);
              column[y + 1] = column[y] = wind;
            }
          }
        }
      }
      columns[x + 1] = columns[x] = column;
    }

    while (x < bounds.width) {
      interpolateColumn(x);
      x += 2;
    }

    return createField(columns, bounds);
  };

  /**
   * Moves the wind particles.
   */
  var evolve = function evolve(buckets, particles, field) {
    buckets.forEach(function (bucket) {
      bucket.length = 0;
    });
    particles.forEach(function (particle) {
      if (particle.age > MAX_PARTICLE_AGE) {
        field.randomize(particle).age = 0;
      }

      // Vector at current position.
      var vector = field(particle.x, particle.y);

      if (vector[2] === null) {
        // Particle has escaped the grid, never to return.
        particle.age = MAX_PARTICLE_AGE;
      } else {
        var xt = particle.x + vector[0];
        var yt = particle.y + vector[1];

        if (field(xt, yt)[2] !== null) {
          // Path from (x,y) to (xt,yt) is visible, so add this particle to
          // the appropriate draw bucket.
          particle.xt = xt;
          particle.yt = yt;
          buckets[colorScheme.indexFor(vector[2])].push(particle);
        } else {
          // Particle isn't visible, but it still moves through the field.
          particle.x = xt;
          particle.y = yt;
        }
      }
      particle.age += 1;
    });
  };

  /**
   * Animates the wind visualization.
   */
  var animate = function animate(bounds, field, numPoints) {
    colorScheme.indexFor = function (m) {
      // map wind speed to a style
      var len = colorScheme.length - 1;
      return Math.floor(Math.min(m, MAX_WIND_INTENSITY) / MAX_WIND_INTENSITY * len);
    };

    var buckets = colorScheme.map(Array);
    var particleCount = numPoints * particleReduction;
    var particles = [];
    for (var i = 0; i < particleCount; i++) {
      particles.push(field.randomize({
        age: Math.floor(Math.random() * MAX_PARTICLE_AGE)
      }));
    }

    var counter = 0;
    context.renderer.prepare(context, particleWidth, particleFadeOpacity);

    (function frame() {
      try {
        if (!windy.stop) {
          counter += 1;
          if (counter >= 1000) {
            counter = 0;
            clear();
          }
          (0, _functions.getAnimationFrame)(frame);
          evolve(buckets, particles, field);
          context.renderer.draw(buckets, bounds, context, colorScheme);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  };

  /**
   * Updates the wind animation with new configurations.
   * @param {!ConfigPayload} A ConfigPayload instance. 
   */
  var start = function start(config) {
    var extent = config.extent();
    var width = extent.width;
    var height = extent.height;
    var bounds = extent.cropBounds || [[0, 0], [width, height]];

    config.canvas.width = width;
    config.canvas.height = height;
    config.canvas.style.width = width + 'px';
    config.canvas.style.height = height + 'px';

    var mapBounds = {
      south: _math.math.deg2rad(extent.latlng[0][1]),
      north: _math.math.deg2rad(extent.latlng[1][1]),
      east: _math.math.deg2rad(extent.latlng[1][0]),
      west: _math.math.deg2rad(extent.latlng[0][0]),
      width: width,
      height: height
    };

    // Do not animate if map repeats across x-axis.
    // @TODO (dannycochran) Figure out how to continuously display wind across
    // repeating map layout.
    if (mapBounds.west - mapBounds.east > 0 || Math.abs(mapBounds.west) - Math.abs(mapBounds.east) === 0 || !config.data) {
      if (config.boundsExceededCallback) {
        config.boundsExceededCallback(mapBounds);
      }
      return;
    }

    // Optional configurations.
    colorScheme = config.colorScheme || colorScheme;
    velocityScale = config.velocityScale || velocityScale;
    particleWidth = config.particleWidth || particleWidth;
    particleFadeOpacity = config.particleFadeOpacity || particleFadeOpacity;
    particleReduction = config.particleReduction || particleReduction;

    // Build grid.
    var grid = buildGrid(config.data);
    var builtBounds = buildBounds(bounds, width, height);

    windy.field = interpolateField(grid, builtBounds, mapBounds);;
    windy.mapBounds = mapBounds;

    windy.stop = false;
    animate(builtBounds, windy.field, config.data[0].data.length);
  };

  /**
   * Stops and clears the wind animation.
   */
  var stop = function stop() {
    clear();
    windy.stop = true;
    if (windy.field) windy.field.release();
  };

  /**
   * Clear the drawing context.
   */
  var clear = function clear() {
    if (!windy.mapBounds) return;
    context.renderer.clear(context, windy.mapBounds);
  };

  var windy = {};

  return { stop: stop, start: start };
};

/** 
 * Returns the context for a given canvas element or null if unsupported.
 * @param {!HTMLCanvasElement} canvasEl The canvas upon which to draw.
 * @return {?WebGLRenderingContext|CanvasRenderingContext2D}
 */
function getContext(canvasEl) {
  var ctx = null;

  if (canvasEl.getContext) {
    [['2d', _canvas.canvas]].forEach(function (typePair) {
      if (!ctx) {
        ctx = canvasEl.getContext(typePair[0]);
        if (ctx) ctx.renderer = typePair[1];
      }
    });
  }

  return ctx;
};

},{"../renderers/canvas":2,"../renderers/gl":3,"../utilities/functions":4,"../utilities/math":5}]},{},[1]);
