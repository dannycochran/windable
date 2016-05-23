(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _wind = require('./wind/wind');

window.WindMap = _wind.WindMap;

},{"./wind/wind":9}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CanvasRenderer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _renderer = require('./../renderer');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CanvasRenderer = exports.CanvasRenderer = function (_Renderer) {
  _inherits(CanvasRenderer, _Renderer);

  function CanvasRenderer() {
    _classCallCheck(this, CanvasRenderer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(CanvasRenderer).apply(this, arguments));
  }

  _createClass(CanvasRenderer, [{
    key: 'prepare_',
    value: function prepare_() {
      this.context.lineWidth = this.config_.particleWidth;
      this.context.fillStyle = 'rgba(0, 0, 0, ' + this.config_.particleFadeOpacity + ')';

      return this;
    }
  }, {
    key: 'draw_',
    value: function draw_(buckets, bounds) {
      var _this2 = this;

      // Blend the existing layers.
      this.context.globalCompositeOperation = 'destination-in';
      this.context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.context.globalCompositeOperation = 'source-over';

      // Draw new particle trails.
      buckets.forEach(function (bucket, i) {
        if (bucket.length > 0) {
          _this2.context.beginPath();
          _this2.context.strokeStyle = _this2.config_.colorScheme[i];

          bucket.forEach(function (particle) {
            _this2.context.moveTo(particle.x1, particle.y1);
            _this2.context.lineTo(particle.x2, particle.y2);
            particle.x1 = particle.x2;
            particle.y1 = particle.y2;
          });

          _this2.context.stroke();
        }
      });

      return this;
    }
  }, {
    key: 'clear_',
    value: function clear_() {
      _get(Object.getPrototypeOf(CanvasRenderer.prototype), 'clear_', this).call(this);
      if (!this.mapBounds_) return;

      this.context.clearRect(0, 0, this.mapBounds_.width, this.mapBounds_.height);

      if (this.context.resetTransform) {
        this.context.resetTransform();
      } else {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
      }

      return this;
    }
  }]);

  return CanvasRenderer;
}(_renderer.Renderer);

;

},{"./../renderer":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebGLRenderer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _shaders = require('./shaders');

var _renderer = require('./../renderer');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebGLRenderer = exports.WebGLRenderer = function (_Renderer) {
  _inherits(WebGLRenderer, _Renderer);

  function WebGLRenderer(canvas, extent, context) {
    _classCallCheck(this, WebGLRenderer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebGLRenderer).call(this, canvas, extent, context));

    _this.gl = context;
    _this.particlesProgram = _this.createProgram_(_shaders.particleVert, _shaders.particleFrag);
    _this.rectProgram = _this.createProgram_(_shaders.rectVert, _shaders.rectFrag);
    _this.resolution = window.devicePixelRatio || 1;
    _this.scale = 1;
    _this.NUM_ATTRS = 6;

    _this.gl.linkProgram(_this.rectProgram);
    _this.gl.linkProgram(_this.particlesProgram);

    _this.gl.enable(_this.gl.BLEND);
    _this.gl.blendEquation(_this.gl.FUNC_ADD);

    canvas.addEventListener('webglcontextlost', function (e) {
      return _this.onContextLost_(e);
    });
    canvas.addEventListener('webglcontextrestored', function (e) {
      return _this.onContextRestored_(e);
    });
    return _this;
  }

  _createClass(WebGLRenderer, [{
    key: 'createProgram_',
    value: function createProgram_(vert, frag) {
      var _this2 = this;

      var getShaders = function getShaders(type, source) {
        var shader = _this2.gl.createShader(type);
        _this2.gl.shaderSource(shader, source);
        _this2.gl.compileShader(shader);
        return shader;
      };

      var vertexShader = getShaders(this.gl.VERTEX_SHADER, vert);
      var fragmentShader = getShaders(this.gl.FRAGMENT_SHADER, frag);
      var shaderProgram = this.gl.createProgram();

      this.gl.attachShader(shaderProgram, vertexShader);
      this.gl.attachShader(shaderProgram, fragmentShader);
      return shaderProgram;
    }
  }, {
    key: 'prepare_',
    value: function prepare_() {
      this.clear_();
      return this;
    }
  }, {
    key: 'blendLayers_',
    value: function blendLayers_() {
      this.gl.blendFunc(this.gl.DST_ALPHA, this.gl.ONE_MINUS_DST_ALPHA);
      this.gl.useProgram(this.rectProgram);

      var positionLocation = this.gl.getAttribLocation(this.rectProgram, 'a_position');
      var buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), this.gl.STATIC_DRAW);
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }
  }, {
    key: 'draw_',
    value: function draw_(buckets, bounds) {
      this.blendLayers_();

      this.gl.useProgram(this.particlesProgram);

      var buffer = this.gl.createBuffer();
      var particlesBuffer = new Float32Array(this.particleVectors_);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, particlesBuffer, this.gl.STATIC_DRAW);

      var resolutionLocation = this.gl.getUniformLocation(this.particlesProgram, 'u_resolution');
      this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

      var positionLocation = this.gl.getAttribLocation(this.particlesProgram, 'a_position');
      var rgbaLocation = this.gl.getAttribLocation(this.particlesProgram, 'a_rgba');

      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.enableVertexAttribArray(rgbaLocation);

      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, this.NUM_ATTRS * Float32Array.BYTES_PER_ELEMENT, 0);
      this.gl.vertexAttribPointer(rgbaLocation, 4, this.gl.FLOAT, false, this.NUM_ATTRS * Float32Array.BYTES_PER_ELEMENT, 8);

      var lineWidthRange = this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
      var lineWidth = this.config_.particleWidth * Math.abs(this.scale * this.resolution);
      var lineWidthInRange = Math.min(Math.max(lineWidth, lineWidthRange[0]), lineWidthRange[1]);

      this.gl.lineWidth(lineWidthInRange);
      this.gl.drawArrays(this.gl.LINES, 0, this.particleVectors_.length / this.NUM_ATTRS);

      return this;
    }
  }, {
    key: 'clear_',
    value: function clear_() {
      _get(Object.getPrototypeOf(WebGLRenderer.prototype), 'clear_', this).call(this);
      this.context.clear(this.context.COLOR_BUFFER_BIT);
      this.context.viewport(0, 0, this.context.drawingBufferWidth, this.context.drawingBufferHeight);
      return this;
    }
  }, {
    key: 'onContextLost_',
    value: function onContextLost_(e) {
      e.preventDefault();
      this.stopped_ = true;
      this.clear_();
    }
  }, {
    key: 'onContextRestored_',
    value: function onContextRestored_(e) {
      this.clear_().start_();
    }
  }]);

  return WebGLRenderer;
}(_renderer.Renderer);

;

},{"./../renderer":5,"./shaders":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var particleFrag = exports.particleFrag = ' \
  precision mediump float; \
  varying vec4 rgba; \
  void main() { \
    gl_FragColor = rgba; \
  }';

var particleVert = exports.particleVert = ' \
  uniform vec2 u_resolution; \
  attribute vec2 a_position; \
  attribute vec4 a_rgba; \
  varying vec4 rgba; \
  void main() { \
    vec2 clipspace = a_position / u_resolution * 2.0 - 1.0; \
    gl_Position = vec4(clipspace * vec2(1, -1), 0, 1); \
    rgba = a_rgba / 255.0; \
  }';

var rectFrag = exports.rectFrag = ' \
  void main() { \
    gl_FragColor = vec4(0,0,0,0.97); \
  }';

var rectVert = exports.rectVert = ' \
  attribute vec2 a_position; \
  void main() { \
    gl_Position = vec4(a_position, 0, 1); \
  }';

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Renderer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * A modified version of Earth.nullschool's original implementation.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Much of the rendering logic from that library is untouched; the updates are
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * mostly aesthetic.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @license
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * The MIT License (MIT)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2014 Cameron Beccario
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Permission is hereby granted, free of charge, to any person obtaining a copy
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * of this software and associated documentation files (the "Software"), to
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * deal in the Software without restriction, including without limitation the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * sell copies of the Software, and to permit persons to whom the Software is
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * furnished to do so, subject to the following conditions:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * The above copyright notice and this permission notice shall be included in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * all copies or substantial portions of the Software.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * THE SOFTWARE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _functions = require('./../utilities/functions');

var _math = require('./../utilities/math');

var _palettes = require('./../utilities/palettes');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Wind velocity at which particle intensity is maximum (m/s).
var MAX_WIND_INTENSITY = 30;

// Max number of frames a particle is drawn before regeneration.
var MAX_PARTICLE_AGE = 100;

// Singleton for no wind in the form: [u, v, m/s].
var NULL_WIND_VECTOR = [NaN, NaN, null];

var Renderer = exports.Renderer = function () {
  function Renderer(canvas, extent, context) {
    _classCallCheck(this, Renderer);

    // Canvas element.
    this.canvas = canvas;

    // Returns map boundaries extent.
    this.extent = extent;

    // Canvas context.
    this.context = context;

    // Some default palettes.
    this.palettes = _palettes.palettes;

    // A reference to the last used data source.
    this.data_ = null;

    // Boolean indicating if animation frame should continue.
    this.stopped_ = true;

    // The particle field.
    this.field_ = null;

    // The map boundaries.
    this.mapBounds_ = null;

    // Holds all the particles as length 6 vectors in an array.
    this.particleVectors_ = [];

    // Holds an RGB color scheme.
    this.rgbColorScheme_ = {};

    // Stores the max wind speed.
    this.maxWindSpeed_ = 0;

    // Configurable fields for the user.
    this.config_ = {
      // An array of color hex codes.
      colorScheme: _palettes.palettes.Purples,
      // The lower this is, the faster the particles disappear from the screen.
      particleFadeOpacity: 0.97,
      // Scale for wind velocity (Arbitrary; smaller values reduce velocity).
      velocityScale: 1 / 200000,
      // Line width of a drawn particle.
      particleWidth: 2,
      // Reduce particle count to this fraction (improves FPS).
      particleReduction: 0.1
    };

    // Determine the context type.
    if (!canvas) {
      throw new Error('Must provide an HTMLCanvasElement.');
    } else if (!extent) {
      throw new Error('Must provide an extent function.');
    } else if (!context) {
      throw new Error('Must provide a canvas context.');
    }
  }

  /**
   * Updates the wind animation with new configurations.
   * @param {!ConfigPayload} A ConfigPayload instance. 
   */


  _createClass(Renderer, [{
    key: 'start_',
    value: function start_(config) {
      var extent = this.extent();

      var width = extent.width;
      var height = extent.height;
      var bounds = extent.cropBounds || [[0, 0], [width, height]];

      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';

      this.mapBounds_ = {
        south: _math.math.deg2rad(extent.latlng[0][1]),
        north: _math.math.deg2rad(extent.latlng[1][1]),
        east: _math.math.deg2rad(extent.latlng[1][0]),
        west: _math.math.deg2rad(extent.latlng[0][0]),
        width: width,
        height: height
      };
      this.data_ = config.data || this.data_;

      // Do not animate if map repeats across x-axis.
      // @TODO (dannycochran) Figure out how to continuously display wind across
      // repeating map layout.
      if (this.mapBounds_.west - this.mapBounds_.east > 0 || Math.abs(this.mapBounds_.west) - Math.abs(this.mapBounds_.east) === 0 || !this.data_) {
        if (config.boundsExceededCallback) {
          config.boundsExceededCallback(this.mapBounds_);
        }
        return;
      }

      // Optional configurations.
      this.config_.colorScheme = config.colorScheme || this.config_.colorScheme;
      this.config_.velocityScale = config.velocityScale || this.config_.velocityScale;
      this.config_.particleWidth = config.particleWidth || this.config_.particleWidth;
      this.config_.particleFadeOpacity = config.particleFadeOpacity || this.config_.particleFadeOpacity;
      this.config_.particleReduction = config.particleReduction || this.config_.particleReduction;

      // Build grid.
      var grid = this.buildGrid_(this.data_);
      var builtBounds = this.buildBounds_(bounds, width, height);

      this.grid_ = grid;
      this.field_ = this.interpolateField_(grid, builtBounds, this.mapBounds_);

      this.stopped_ = false;
      return this.animate_(builtBounds, this.data_[0].data.length);
    }

    /**
     * Stops and clears the wind animation.
     */

  }, {
    key: 'stop_',
    value: function stop_() {
      this.clear_();
      this.stopped_ = true;
      if (this.field_) this.field_.release();

      return this;
    }

    /**
     * Constructs an NX by NY grid (360 by 181 in most cases). Each grid square
     * is 1x1.
     * 
     * @param {!WindData} windData An instance of WindData.
     * @return {!Function} A function to interpolate the wind points on the grid.
     */

  }, {
    key: 'buildGrid_',
    value: function buildGrid_(windData) {
      var _this = this;

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

      /**
       * Returns a [u, v, m/s] array from lng and latitude.
       * @param {number} λ A longitude value from -180 to 180.
       * @param {number} φ A latitude value from -90 - 90.
       * @return {!Array<number>} An array [u, v, m/s].
       */
      var buildVector = function buildVector(λ, φ) {
        // Calculate longitude index in wrapped range [-180, 180).
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
              var vector = _math.math.bilinearInterpolateVector(i - fi, j - fj, g00, g10, g01, g11);
              if (vector[2] > _this.maxWindSpeed_) _this.maxWindSpeed_ = vector[2];
              return vector;
            }
          }
        }
        return null;
      };

      return buildVector.bind(this);
    }

    /**
     * Calculate distortion of the wind vector caused by the shape of the
     * projection at point (x, y). The wind vector is modified in place and
     * returned by this function.
     */

  }, {
    key: 'distort_',
    value: function distort_(λ, φ, x, y, scale, wind) {
      var u = wind[0] * scale;
      var v = wind[1] * scale;
      var d = _math.math.distortion(λ, φ, x, y, this.mapBounds_);

      // Scale distortion vectors by u and v, then add.
      wind[0] = d[0] * u + d[2] * v;
      wind[1] = d[1] * u + d[3] * v;

      return wind;
    }
  }, {
    key: 'createField_',
    value: function createField_(columns, bounds) {
      /**
       * @returns {Array} wind vector [u, v, m/s] at the point (x, y).
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
          x1: Math.round(Math.floor(Math.random() * bounds.width) + bounds.x),
          y1: Math.round(Math.floor(Math.random() * bounds.height) + bounds.y)
        });
      };

      return field;
    }
  }, {
    key: 'buildBounds_',
    value: function buildBounds_(bounds, width, height) {
      var upperLeft = bounds[0];
      var lowerRight = bounds[1];
      var x = Math.round(upperLeft[0]);
      var y = Math.max(Math.floor(upperLeft[1], 0), 0);
      var xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
      var yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
      return { x: x, y: y, xMax: width, yMax: yMax, width: width, height: height };
    }
  }, {
    key: 'interpolateField_',
    value: function interpolateField_(grid, bounds) {
      var _this2 = this;

      var velocity = bounds.height * this.config_.velocityScale;

      var x = bounds.x;
      var columns = [];

      var interpolateColumn = function interpolateColumn(x) {
        var column = [];
        for (var y = bounds.y; y <= bounds.yMax; y += 2) {
          var coord = _math.math.invert(x, y, _this2.mapBounds_);

          if (coord) {
            var λ = coord[0];
            var φ = coord[1];

            if (isFinite(λ)) {
              var wind = grid(λ, φ);

              if (wind) {
                wind = _this2.distort_(λ, φ, x, y, velocity, wind);
                column[y + 1] = column[y] = wind;
              }
            }
          }
        }
        columns[x + 1] = columns[x] = column;
      };

      while (x < bounds.width) {
        interpolateColumn(x);
        x += 2;
      }

      return this.createField_(columns, bounds);
    }

    /**
     * Moves the wind particles.
     */

  }, {
    key: 'evolve_',
    value: function evolve_(buckets, particles) {
      var _this3 = this;

      this.particleVectors_.length = 0;
      buckets.forEach(function (bucket) {
        bucket.length = 0;
      });

      particles.forEach(function (particle) {
        if (particle.age > MAX_PARTICLE_AGE) {
          _this3.field_.randomize(particle).age = 0;
        }

        // Vector at current position.
        var vector = _this3.field_(particle.x1, particle.y1);

        if (vector[2] === null) {
          // Particle has escaped the grid, never to return.
          particle.age = MAX_PARTICLE_AGE;
        } else {
          var x2 = particle.x1 + vector[0];
          var y2 = particle.y1 + vector[1];

          if (_this3.field_(x2, y2)[2] !== null) {
            // Path from (x,y) to (xt,yt) is visible, so add this particle to
            // the appropriate draw bucket.
            particle.x2 = x2;
            particle.y2 = y2;

            var colorIndex = _this3.config_.colorScheme.indexFor(vector[2]);
            var rgba = _this3.rgbColorScheme_.get(colorIndex);

            buckets[colorIndex].push(particle);

            _this3.particleVectors_.push(particle.x1 * _this3.resolution);
            _this3.particleVectors_.push(particle.y1 * _this3.resolution);
            rgba.forEach(function (v) {
              _this3.particleVectors_.push(v);
            });
            _this3.particleVectors_.push(particle.x2 * _this3.resolution);
            _this3.particleVectors_.push(particle.y2 * _this3.resolution);
            rgba.forEach(function (v) {
              _this3.particleVectors_.push(v);
            });
          } else {
            // Particle isn't visible, but it still moves through the field.
            particle.x1 = x2;
            particle.y1 = y2;
          }
        }
        particle.age += 1;
      });
    }

    /**
     * Animates the wind visualization.
     */

  }, {
    key: 'animate_',
    value: function animate_(bounds, numPoints) {
      var _this4 = this;

      this.config_.colorScheme.indexFor = function (m) {
        // map wind speed to a style
        var length = _this4.config_.colorScheme.length - 1;
        return Math.floor(Math.min(m, MAX_WIND_INTENSITY) / MAX_WIND_INTENSITY * length);
      };

      this.rgbColorScheme_ = {
        colors: this.config_.colorScheme.map(function (hex) {
          hex = hex.replace('#', '');
          var r = parseInt(hex.substring(0, 2), 16);
          var g = parseInt(hex.substring(2, 4), 16);
          var b = parseInt(hex.substring(4, 6), 16);

          return [r, g, b, 255];
        }),
        get: function get(index) {
          return _this4.rgbColorScheme_.colors[index];
        }
      };

      var buckets = this.config_.colorScheme.map(Array);
      var particles = [];
      for (var i = 0; i < numPoints * this.config_.particleReduction; i++) {
        particles.push(this.field_.randomize({
          age: Math.floor(Math.random() * MAX_PARTICLE_AGE)
        }));
      }

      var counter = 0;
      this.prepare_();

      var frame = function frame() {
        if (!_this4.stopped_) {
          counter += 1;
          if (counter >= 1000) {
            counter = 0;
            _this4.clear_();
          }
          _this4.currentFrame_ = (0, _functions.getAnimationFrame)(frame);
          _this4.evolve_(buckets, particles);
          _this4.draw_(buckets, bounds);
        }
      };

      frame();
    }

    /**
     * Returns a mapping of color identities to their velocity buckets.
     * @return {!Array<!Array<string, number>>} [hexColor, velocity]
     */

  }, {
    key: 'velocityScale',
    value: function velocityScale() {
      var _this5 = this;

      var increment = MAX_WIND_INTENSITY / this.config_.colorScheme.length;
      return this.config_.colorScheme.map(function (color, idx) {
        idx += 1;
        var value = idx * increment;
        if (idx === _this5.config_.colorScheme.length) value = _this5.maxWindSpeed_;
        return [color, Math.round(_math.math.convertMagnitudeToKMPH(value))];
      });
    }

    /**
     * Returns the wind speed & direction at given x,y relative to the canvas
     * element for the current data frame.
     *
     * @param {number} x An x value.
     * @param {number} y A y value.
     * @return {!Array<!number>} [wind direction, speed].
     */

  }, {
    key: 'pointFromXY',
    value: function pointFromXY(x, y) {
      if (!this.field_) throw new Error('Must supply data first.');
      return _math.math.formatVector(this.field_(x, y));
    }

    /**
     * Returns the wind speed & direction at given coordinates lat,lng for the
     * current data frame.
      * @param {number} lat A latitude value.
     * @param {number} lng A longitude value.
     * @return {!Array<!number>} [wind direction, speed].
     */

  }, {
    key: 'pointFromLatLng',
    value: function pointFromLatLng(lat, lng) {
      if (!this.grid_) throw new Error('Must supply data first.');
      return _math.math.formatVector(this.grid_(lng, lat));
    }

    /**
     * Clear the drawing context. Implementation specific to renderer.
     */

  }, {
    key: 'clear_',
    value: function clear_() {
      if (this.currentFrame_) cancelAnimationFrame(this.currentFrame_);
      return this;
    }

    /**
     * Prepare the drawing context. Implementation specific to renderer.
     */

  }, {
    key: 'prepare_',
    value: function prepare_() {
      return this;
    }

    /**
     * Draw the drawing context. Implementation specific to renderer.
     */

  }, {
    key: 'draw_',
    value: function draw_() {
      return this;
    }
  }]);

  return Renderer;
}();

;

},{"./../utilities/functions":6,"./../utilities/math":7,"./../utilities/palettes":8}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
 * Returns wind direction and speed in KMPH.
 * @param {!Array<number>} wind A wind vector [u, v, m/s]
 * @return {!Array<number>} Returns [wind direction, KMPH]
 */
var formatVector = function formatVector(wind) {
  var d = Math.atan2(-wind[0], -wind[1]) / τ * 360; // calculate into-the-wind cardinal degrees
  var direction = Math.round((d + 360) % 360 / 5) * 5; // shift [-180, 180] to [0, 360], and round to nearest 5.
  var kmph = convertMagnitudeToKMPH(wind[2]);
  return [direction, kmph];
};

/**
 * Returns wind speed.
 * @param {!number} magnitude Wind magnitude from u,v,m.
 * @return {!number} The wind speed in kmph.
 */
var convertMagnitudeToKMPH = function convertMagnitudeToKMPH(magnitude) {
  return magnitude * 3.6;
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
 * Interpolation for vectors like wind (u,v,m/s).
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
  convertMagnitudeToKMPH: convertMagnitudeToKMPH,
  distortion: distortion,
  floorMod: floorMod,
  formatVector: formatVector,
  invert: invert,
  rad2deg: rad2deg
};

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WindMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * A light controller class for using a modified version of Esri's Windy.JS.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _canvas = require('./../renderers/canvas/canvas');

var _functions = require('./../utilities/functions');

var _gl = require('./../renderers/gl/gl');

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

    var contextType = '2d';
    var context = config.canvas.getContext(contextType);

    if (contextType.indexOf('2d') > -1) {
      this.renderer = new _canvas.CanvasRenderer(config.canvas, config.extent, context);
    } else if (contextType.indexOf('webgl') > -1) {
      this.renderer = new _gl.WebGLRenderer(config.canvas, config.extent, context);
    }

    this.debounceStart_ = (0, _functions.debounce)(function (config) {
      _this.renderer.start_(config);
    });

    function getContextType() {
      var _arr = ['webgl-2d', 'webgl', 'webgl-experimental', '2d'];

      for (var _i = 0; _i < _arr.length; _i++) {
        var type = _arr[_i];
        if (config.canvas.getContext(type)) {
          return type;
        }
      }
    };
  }

  /**
   * Stops the WindMap animation.
   * @return {!WindMap} The windmap instance.
   */


  _createClass(WindMap, [{
    key: 'stop',
    value: function stop() {
      this.renderer.stop_();
      return this;
    }

    /**
     * Starts the WindMap animation.
     * @param {!ConfigPayload=} config An instance of ConfigPayload.
     * @param {boolean=} renderImmediately Whether to render immediately instead
     *    of debouncing.
     * @return {!WindMap} The windmap instance.
     */

  }, {
    key: 'start',
    value: function start() {
      var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var renderImmediately = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (renderImmediately) this.renderer.start_(config);else this.debounceStart_(config);

      return this;
    }

    /**
     * Updates the WindMap data and its optional configurations.
     * @param {!ConfigPayload=} config An instance of ConfigPayload.
     * @param {boolean=} renderImmediately Whether to render immediately instead
     *    of debouncing.
     * @return {!WindMap} The windmap instance.
     */

  }, {
    key: 'update',
    value: function update() {
      var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var renderImmediately = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return this.stop().start(config, renderImmediately);
    }
  }]);

  return WindMap;
}();

;

},{"./../renderers/canvas/canvas":2,"./../renderers/gl/gl":3,"./../utilities/functions":6}]},{},[1]);
