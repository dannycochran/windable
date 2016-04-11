(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AltitudeModel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _functions = require('../utilities/functions');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Stores altitude data.
 */

var AltitudeModel = exports.AltitudeModel = function () {
  /**
   * Constructs an altitude model with optional configuration
   * @param {Object=} settings Optional settings:
   *  {
   *    data: A hash of existing wind data.
   *    levels: An array of discrete millibar levels.
   *    millibars: The starting selected millibars level.
   *  }
   */

  function AltitudeModel() {
    var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, AltitudeModel);

    this.data = settings.data || {};
    this.levels = settings.levels || [200, 250, 300, 400, 500, 700, 850, 925, 1000];
    this.millibars = settings.millibars || this.levels[8];
  }

  /**
   * Creates a key hash from a config object.
   * @param {Object=} config An optional config object:
   *  {time: string|Date, millibars: number}
   * @return {!Promise} A promise.
   */


  _createClass(AltitudeModel, [{
    key: 'get',
    value: function get() {
      var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      config = Object.assign({
        time: new Date(),
        millibars: this.millibars
      }, config);

      if (config.time instanceof Date) {
        config.time = (0, _functions.formatTime)(config.time);
      }

      var key = this.key(config);

      if (!this.data[key]) {
        this.data[key] = this.fetch(config);
      }

      this.millibars = config.millibars;
      return this.data[key];
    }

    /**
     * Creates a key hash from a config object.
     * @param {!Object} config A config object:
     *  {time: string, millibars: number}
     * @return {string} A key hash.
     */

  }, {
    key: 'key',
    value: function key(config) {
      return JSON.stringify(config);
    }

    /**
     * Fetches wind data based on a time and millibar level. Uses browser fetch.
     * Override window.fetch with your own Promise if browser support is an issue.
     * @param {!Object} config A config object:
     *  {time: string, millibars: number}
     * @return {!Promise} A promise.
     */

  }, {
    key: 'fetch',
    value: function (_fetch) {
      function fetch(_x) {
        return _fetch.apply(this, arguments);
      }

      fetch.toString = function () {
        return _fetch.toString();
      };

      return fetch;
    }(function (config) {
      return fetch(this.url(config), { method: 'get' }).then(function (response) {
        return response.json();
      }).then(function (json) {
        return json;
      }).catch(function (err) {
        return Promise.resolve(err);
      });
    })

    /**
     * URL from which to fetch data.
     * @param {!Object} config A config object:
     *  {time: string, millibars: number}
     * @return {string} A url string.
     */

  }, {
    key: 'url',
    value: function url(config) {
      return '/wind?time=' + config.time + '&millibars=' + config.millibars;
    }
  }]);

  return AltitudeModel;
}();

;

},{"../utilities/functions":5}],2:[function(require,module,exports){
'use strict';

var _altitude = require('./altitude/altitude');

var _functions = require('./utilities/functions');

var _map = require('./map/map');

var _palettes = require('./utilities/palettes');

var _wind = require('./wind/wind');

require('./build.scss');

// Create an altitude model.
var altitudeModel = new _altitude.AltitudeModel();

// Our available data is hard coded to Friday April 1, 00:00:00.
var windDate = new Date('Fri Apr 9 2016 00:00:00 GMT-0700 (PDT)');

// Populate the select menu with millibar levels.
var menu = document.getElementById('millibar-levels');
var colorsMenu = document.getElementById('color-schemes');
var particleInput = document.getElementById('particles-range');
var speedInput = document.getElementById('speed-range');

altitudeModel.levels.forEach(function (level) {
  var select = document.createElement('option');
  select.innerHTML = level;
  menu.appendChild(select);
});

// // Populate the colors menu.
var colors = Object.keys(_palettes.palettes);
colors.forEach(function (palette) {
  var select = document.createElement('option');
  select.innerHTML = palette;
  colorsMenu.appendChild(select);
});

colorsMenu.selectedIndex = colors.indexOf('default');
menu.selectedIndex = altitudeModel.levels.indexOf(altitudeModel.millibars);

// Wait for the data to load and the map to be in the DOM.
Promise.all([altitudeModel.get({ time: windDate }), _map.googleMap.load]).then(function (response) {
  var windMap = new _wind.WindMap({
    canvas: _map.googleMap.canvas,
    element: _map.googleMap.element,
    data: response[0],
    extent: _map.googleMap.extent
  });

  ['bounds_changed', 'resize'].forEach(function (listener) {
    _map.googleMap.map.addListener(listener, windMap.update.bind(windMap));
  });

  // UI STUFF
  var onSelectAltitude = function onSelectAltitude(e) {
    var selectedIndex = menu.selectedIndex;
    menu.disabled = true;
    altitudeModel.get({
      time: windDate,
      millibars: altitudeModel.levels[selectedIndex]
    }).then(function (data) {
      windMap.update({ data: data });
      menu.disabled = false;
    });
  };

  var onSelectColor = function onSelectColor(e) {
    var selectedIndex = colorsMenu.selectedIndex;
    windMap.update({ colorScheme: _palettes.palettes[colors[selectedIndex]] });
  };

  var onChangeParticleCount = function onChangeParticleCount(e) {
    var value = Math.max(Number(e.currentTarget.value) / 100, 0.01);
    windMap.update({ particleReduction: value });
  };

  var onChangeParticleSpeed = function onChangeParticleSpeed(e) {
    var value = parseFloat(e.currentTarget.value) * 0.0000001;
    windMap.update({ velocityScale: value });
  };

  speedInput.addEventListener('change', onChangeParticleSpeed);
  particleInput.addEventListener('change', onChangeParticleCount);
  menu.addEventListener('change', onSelectAltitude);
  colorsMenu.addEventListener('change', onSelectColor);
});

},{"./altitude/altitude":1,"./build.scss":3,"./map/map":4,"./utilities/functions":5,"./utilities/palettes":7,"./wind/wind":8}],3:[function(require,module,exports){
module.exports = require('sassify').byUrl('data:text/css;base64,aHRtbCwgYm9keSB7CiAgd2lkdGg6IDEwMCU7CiAgaGVpZ2h0OiAxMDAlOwogIG1hcmdpbjogMDsKICBwYWRkaW5nOiAwIDAgMCAwOyB9CgojYWx0aXR1ZGUtbWVudSwgI2NvbG9ycy1tZW51LCAjcGFydGljbGVzLW1lbnUsICNzcGVlZC1tZW51IHsKICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgd2lkdGg6IDIwMHB4OwogIHRvcDogMTBweDsKICByaWdodDogMTBweDsKICBiYWNrZ3JvdW5kLWNvbG9yOiBsaWdodGdyZXk7CiAgcGFkZGluZzogMTBweDsgfQogICNhbHRpdHVkZS1tZW51IGxhYmVsLCAjY29sb3JzLW1lbnUgbGFiZWwsICNwYXJ0aWNsZXMtbWVudSBsYWJlbCwgI3NwZWVkLW1lbnUgbGFiZWwgewogICAgcGFkZGluZzogNXB4OwogICAgZGlzcGxheTogYmxvY2s7IH0KICAjYWx0aXR1ZGUtbWVudSBzZWxlY3QsICNjb2xvcnMtbWVudSBzZWxlY3QsICNwYXJ0aWNsZXMtbWVudSBzZWxlY3QsICNzcGVlZC1tZW51IHNlbGVjdCB7CiAgICB3aWR0aDogMTAwJTsgfQogICNhbHRpdHVkZS1tZW51IGlucHV0LCAjY29sb3JzLW1lbnUgaW5wdXQsICNwYXJ0aWNsZXMtbWVudSBpbnB1dCwgI3NwZWVkLW1lbnUgaW5wdXQgewogICAgd2lkdGg6IDEwMCU7IH0KCiNjb2xvcnMtbWVudSB7CiAgdG9wOiA5MHB4OyB9CgojcGFydGljbGVzLW1lbnUgewogIHRvcDogMTcwcHg7IH0KCiNzcGVlZC1tZW51IHsKICB0b3A6IDI1MHB4OyB9CgoucGFyZW50LnBlcnNwZWN0aXZlIHsKICAtd2Via2l0LXRyYW5zZm9ybTogcGVyc3BlY3RpdmUoMjUwcHgpIHJvdGF0ZVgoMzBkZWcpOwogIC1tb3otdHJhbnNmb3JtOiBwZXJzcGVjdGl2ZSgyNTBweCkgcm90YXRlWCgzMGRlZyk7CiAgLXdlYmtpdC10cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkOwogIC1tb3otdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDsgfQoKLm1hcCB7CiAgcG9zaXRpb246IHJlbGF0aXZlOwogIGhlaWdodDogMTAwJTsKICB3aWR0aDogMTAwJTsKICAtbW96LXRyYW5zZm9ybTogdHJhbnNsYXRlWig1MHB4KTsKICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlWig1MHB4KTsgfQoKLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxld29KSW5abGNuTnBiMjRpT2lBekxBb0pJbVpwYkdVaU9pQWlZblZwYkdRdWMyTnpjeUlzQ2draWMyOTFjbU5sY3lJNklGc0tDUWtpWW5WcGJHUXVjMk56Y3lJS0NWMHNDZ2tpYzI5MWNtTmxjME52Ym5SbGJuUWlPaUJiQ2drSklrQmphR0Z5YzJWMElDZDFkR1l0T0NjN1hHNWNibWgwYld3c0lHSnZaSGtnZTF4dUlDQjNhV1IwYURvZ01UQXdKVHRjYmlBZ2FHVnBaMmgwT2lBeE1EQWxPMXh1SUNCdFlYSm5hVzQ2SURBN1hHNGdJSEJoWkdScGJtYzZJREFnTUNBd0lEQTdYRzU5WEc1Y2JpTmhiSFJwZEhWa1pTMXRaVzUxTENBalkyOXNiM0p6TFcxbGJuVXNJQ053WVhKMGFXTnNaWE10YldWdWRTd2dJM053WldWa0xXMWxiblVnZTF4dUlDQndiM05wZEdsdmJqb2dZV0p6YjJ4MWRHVTdYRzRnSUhkcFpIUm9PaUF5TURCd2VEdGNiaUFnZEc5d09pQXhNSEI0TzF4dUlDQnlhV2RvZERvZ01UQndlRHRjYmlBZ1ltRmphMmR5YjNWdVpDMWpiMnh2Y2pvZ2JHbG5hSFJuY21WNU8xeHVJQ0J3WVdSa2FXNW5PaUF4TUhCNE8xeHVJQ0JzWVdKbGJDQjdYRzRnSUNBZ2NHRmtaR2x1WnpvZ05YQjRPMXh1SUNBZ0lHUnBjM0JzWVhrNklHSnNiMk5yTzF4dUlDQjlYRzRnSUhObGJHVmpkQ0I3WEc0Z0lDQWdkMmxrZEdnNklERXdNQ1U3WEc0Z0lIMWNiaUFnYVc1d2RYUWdlMXh1SUNBZ0lIZHBaSFJvT2lBeE1EQWxPMXh1SUNCOVhHNTlYRzVjYmlOamIyeHZjbk10YldWdWRTQjdYRzRnSUhSdmNEb2dPVEJ3ZUR0Y2JuMWNibHh1STNCaGNuUnBZMnhsY3kxdFpXNTFJSHRjYmlBZ2RHOXdPaUF4TnpCd2VEdGNibjFjYmx4dUkzTndaV1ZrTFcxbGJuVWdlMXh1SUNCMGIzQTZJREkxTUhCNE8xeHVmVnh1WEc0dWNHRnlaVzUwTG5CbGNuTndaV04wYVhabElIdGNiaUFnTFhkbFltdHBkQzEwY21GdWMyWnZjbTA2SUhCbGNuTndaV04wYVhabEtESTFNSEI0S1NCeWIzUmhkR1ZZS0RNd1pHVm5LVHRjYmlBZ0lDQWdMVzF2ZWkxMGNtRnVjMlp2Y20wNklIQmxjbk53WldOMGFYWmxLREkxTUhCNEtTQnliM1JoZEdWWUtETXdaR1ZuS1R0Y2JpQWdMWGRsWW10cGRDMTBjbUZ1YzJadmNtMHRjM1I1YkdVNklIQnlaWE5sY25abExUTmtPMXh1SUNBZ0lDQXRiVzk2TFhSeVlXNXpabTl5YlMxemRIbHNaVG9nY0hKbGMyVnlkbVV0TTJRN1hHNTlYRzVjYmk1dFlYQWdlMXh1SUNCd2IzTnBkR2x2YmpvZ2NtVnNZWFJwZG1VN1hHNGdJR2hsYVdkb2REb2dNVEF3SlR0Y2JpQWdkMmxrZEdnNklERXdNQ1U3WEc0Z0lDMXRiM290ZEhKaGJuTm1iM0p0T2lCMGNtRnVjMnhoZEdWYUtEVXdjSGdwTzF4dUlDQXRkMlZpYTJsMExYUnlZVzV6Wm05eWJUb2dkSEpoYm5Oc1lYUmxXaWcxTUhCNEtUdGNibjBpQ2dsZExBb0pJbTFoY0hCcGJtZHpJam9nSWtGQlJVRXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJRenRGUVVOVUxFdEJRVXNzUlVGQlJTeEpRVUZMTzBWQlExb3NUVUZCVFN4RlFVRkZMRWxCUVVzN1JVRkRZaXhOUVVGTkxFVkJRVVVzUTBGQlJUdEZRVU5XTEU5QlFVOHNSVUZCUlN4UFFVRlJMRWRCUTJ4Q096dEJRVVZFTEdOQlFXTXNSVUZCUlN4WlFVRlpMRVZCUVVVc1pVRkJaU3hGUVVGRkxGZEJRVmNzUTBGQlF6dEZRVU42UkN4UlFVRlJMRVZCUVVVc1VVRkJVenRGUVVOdVFpeExRVUZMTEVWQlFVVXNTMEZCVFR0RlFVTmlMRWRCUVVjc1JVRkJSU3hKUVVGTE8wVkJRMVlzUzBGQlN5eEZRVUZGTEVsQlFVczdSVUZEV2l4blFrRkJaMElzUlVGQlJTeFRRVUZWTzBWQlF6VkNMRTlCUVU4c1JVRkJSU3hKUVVGTExFZEJWMlk3UlVGcVFrUXNZMEZCWXl4RFFVOWFMRXRCUVVzc1JVRlFVeXhaUVVGWkxFTkJUekZDTEV0QlFVc3NSVUZRZFVJc1pVRkJaU3hEUVU4elF5eExRVUZMTEVWQlVIZERMRmRCUVZjc1EwRlBlRVFzUzBGQlN5eERRVUZETzBsQlEwb3NUMEZCVHl4RlFVRkZMRWRCUVVrN1NVRkRZaXhQUVVGUExFVkJRVVVzUzBGQlRTeEhRVU5vUWp0RlFWWklMR05CUVdNc1EwRlhXaXhOUVVGTkxFVkJXRkVzV1VGQldTeERRVmN4UWl4TlFVRk5MRVZCV0hOQ0xHVkJRV1VzUTBGWE0wTXNUVUZCVFN4RlFWaDFReXhYUVVGWExFTkJWM2hFTEUxQlFVMHNRMEZCUXp0SlFVTk1MRXRCUVVzc1JVRkJSU3hKUVVGTExFZEJRMkk3UlVGaVNDeGpRVUZqTEVOQlkxb3NTMEZCU3l4RlFXUlRMRmxCUVZrc1EwRmpNVUlzUzBGQlN5eEZRV1IxUWl4bFFVRmxMRU5CWXpORExFdEJRVXNzUlVGa2QwTXNWMEZCVnl4RFFXTjRSQ3hMUVVGTExFTkJRVU03U1VGRFNpeExRVUZMTEVWQlFVVXNTVUZCU3l4SFFVTmlPenRCUVVkSUxGbEJRVmtzUTBGQlF6dEZRVU5ZTEVkQlFVY3NSVUZCUlN4SlFVRkxMRWRCUTFnN08wRkJSVVFzWlVGQlpTeERRVUZETzBWQlEyUXNSMEZCUnl4RlFVRkZMRXRCUVUwc1IwRkRXanM3UVVGRlJDeFhRVUZYTEVOQlFVTTdSVUZEVml4SFFVRkhMRVZCUVVVc1MwRkJUU3hIUVVOYU96dEJRVVZFTEU5QlFVOHNRVUZCUVN4WlFVRlpMRU5CUVVNN1JVRkRiRUlzYVVKQlFXbENMRVZCUVVVc2EwSkJRVmNzUTBGQlVTeGpRVUZQTzBWQlF6RkRMR05CUVdNc1JVRkJSU3hyUWtGQlZ5eERRVUZSTEdOQlFVODdSVUZETjBNc2RVSkJRWFZDTEVWQlFVVXNWMEZCV1R0RlFVTnNReXh2UWtGQmIwSXNSVUZCUlN4WFFVRlpMRWRCUTNSRE96dEJRVVZFTEVsQlFVa3NRMEZCUXp0RlFVTklMRkZCUVZFc1JVRkJSU3hSUVVGVE8wVkJRMjVDTEUxQlFVMHNSVUZCUlN4SlFVRkxPMFZCUTJJc1MwRkJTeXhGUVVGRkxFbEJRVXM3UlVGRFdpeGpRVUZqTEVWQlFVVXNaMEpCUVZVN1JVRkRNVUlzYVVKQlFXbENMRVZCUVVVc1owSkJRVlVzUjBGRE9VSWlMQW9KSW01aGJXVnpJam9nVzEwS2ZRPT0gKi8=');;
},{"sassify":10}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var resolve = void 0;

var googleMap = exports.googleMap = {
  element: undefined,
  map: undefined,
  canvas: undefined,
  load: new Promise(function (res, rej) {
    resolve = res;
  }),
  update: update,
  extent: extent
};

/**
 * Returns extent of the map: [[west (xmin), south (ymin)],
 *                             [east (xmax), north(ymax)]].  
 * @return {!Array<!Array<number,number>>} Bounds of the map.
 */
function extent() {
  var bounds = googleMap.map.getBounds();

  return [[bounds.j.j, bounds.R.R], [bounds.j.R, bounds.R.j]];
}

function init() {
  // initialize the map
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(39.3, -95.8),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [{
      featureType: 'water',
      stylers: [{ color: '#ffffff' }]
    }, {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]
    }]
  };

  googleMap.element = document.getElementById('google-map-canvas');
  googleMap.map = new google.maps.Map(googleMap.element, mapOptions);

  // initialize the canvasLayer
  var canvasLayerOptions = {
    map: googleMap.map,
    animate: false,
    updateHandler: function updateHandler() {
      return resolve(update());
    }
  };
  var canvasLayer = new CanvasLayer(canvasLayerOptions);
  googleMap.canvas = canvasLayer.canvas;
}

/**
 * We need to scale and translate the map for current view.
 * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinates
 */
function update() {
  var mapProjection = googleMap.map.getProjection();
  var scale = Math.pow(2, googleMap.map.zoom);
  googleMap.canvas.getContext('2d').scale(scale, scale);
}

window.onload = init;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debounce = debounce;
exports.supportsCanvas = supportsCanvas;
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
 * Checks if the browser supports canvas.
 */
function supportsCanvas() {
  return !!document.createElement('canvas').getContext;
}

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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
palettes.default = palettes.BuPu;

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WindMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * A light controller class for using a modified version of Esri's Windy.JS.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _functions = require('../utilities/functions');

var _windy = require('./windy');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ConfigPayload can be passed at construction and on update.
 *
 * @typedef {{
 *   canvas: (!HTMLCanvasElement) The canvas to which wind will be rendered.
 *   element: (!HTMLElement|Object) A parent element of the canvas.
 *   extent: (Function():!Array<Array<number, number>>) [[west, south], [east, north]]
 *   data: (!Object) Wind data from NOAA (see examples in data/)
 * }}
 */
var ConfigPayload = void 0;

var WindMap = exports.WindMap = function () {
  /**
   * A constructor for the WindMap.
   * @param {!ConfigPayload} config An instance of ConfigPayload.
   */

  function WindMap(config) {
    var _this = this;

    _classCallCheck(this, WindMap);

    if (!(0, _functions.supportsCanvas)()) {
      throw new Error('Browser does not support canvas.');
    }

    // Required configuration fields.
    this.config_ = {
      canvas: config.canvas,
      extent: config.extent,
      element: config.element,
      data: config.data || {}
    };

    this.windy_ = new _windy.Windy({ canvas: config.canvas });
    this.updateWindy_ = (0, _functions.debounce)(function () {
      _this.windy_.update(_this.config_);
    });

    this.update(config);
  }

  _createClass(WindMap, [{
    key: 'stop',
    value: function stop() {
      this.windy_.stop();
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
        colorScheme: config.colorScheme,
        bounds: config.bounds,
        velocityScale: config.velocityScale,
        particleWidth: config.particleWidth,
        particleFadeOpacity: config.particleFadeOpacity,
        particleReduction: config.particleReduction
      });

      // Update the data if it exists.
      if (config.data) this.config_.data = config.data;

      this.updateWindy_();
      return this;
    }
  }]);

  return WindMap;
}();

},{"../utilities/functions":5,"./windy":9}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Windy = undefined;

var _functions = require('../utilities/functions');

var _math = require('../utilities/math');

/**
 * A modified version of Esri's Windy.JS, which itself draws heavily from
 * Earth.nullschool's original implementation. Almost all of the logic from
 * those original libraries is untouched; the updates are purely aesthetic.
 *
 * https://github.com/Esri/wind-js (MIT License)
 * https://github.com/cambecc/earth (MIT License)
 */

var Windy = exports.Windy = function Windy(windyConfig) {
  // Wind velocity at which particle intensity is maximum (m/s).
  var MAX_WIND_INTENSITY = 30;

  // Max number of frames a particle is drawn before regeneration.
  var MAX_PARTICLE_AGE = 100;

  // Particle count scalar (completely arbitrary--this values looks nice).
  var PARTICLE_MULTIPLIER = 8;

  // Singleton for no wind in the form: [u, v, magnitude].
  var NULL_WIND_VECTOR = [NaN, NaN, null];

  // Default color scheme is Purple -> Blue.
  var colorScheme = ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'];

  // The lower this is, the faster the particles disappear from the screen.
  var particleFadeOpacity = 0.97;

  // Scale for wind velocity (Arbitrary; smaller values reduce velocity).
  var velocityScale = 1 / 200000;

  // Line width of a drawn particle.
  var particleWidth = 2;

  // Reduce particle count to this fraction (improves FPS).
  var particleReduction = 0.75;

  var createWindBuilder = function createWindBuilder(uComp, vComp) {
    return {
      data: function data(i) {
        return [uComp.data[i], vComp.data[i]];
      },
      header: uComp.header,
      interpolate: _math.math.bilinearInterpolateVector
    };
  };

  var createBuilder = function createBuilder(windData) {
    var uComp = null;
    var vComp = null;

    windData.forEach(function (record) {
      switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
        case "2,2":
          uComp = record;break;
        case "2,3":
          vComp = record;break;
      }
    });

    return createWindBuilder(uComp, vComp);
  };

  var buildGrid = function buildGrid(windData) {
    var builder = createBuilder(windData);

    var header = builder.header;
    var λ0 = header.lo1,
        φ0 = header.la1; // the grid's origin (e.g., 0.0E, 90.0N)
    var Δλ = header.dx,
        Δφ = header.dy; // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
    var ni = header.nx,
        nj = header.ny; // number of grid points W-E and N-S (e.g., 144 x 73)
    var date = new Date(header.refTime);
    date.setHours(date.getHours() + header.forecastTime);

    // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    var grid = [],
        p = 0;
    var isContinuous = Math.floor(ni * Δλ) >= 360;
    for (var j = 0; j < nj; j++) {
      var row = [];
      for (var i = 0; i < ni; i++, p++) {
        row[i] = builder.data(p);
      }
      if (isContinuous) {
        // For wrapped grids, duplicate first column as last column to simplify interpolation logic
        row.push(row[0]);
      }
      grid[j] = row;
    }

    function interpolate(λ, φ) {
      var i = _math.math.floorMod(λ - λ0, 360) / Δλ; // calculate longitude index in wrapped range [0, 360)
      var j = (φ0 - φ) / Δφ; // calculate latitude index in direction +90 to -90

      var fi = Math.floor(i),
          ci = fi + 1;
      var fj = Math.floor(j),
          cj = fj + 1;

      var row;
      if (row = grid[fj]) {
        var g00 = row[fi];
        var g10 = row[ci];
        if ((0, _functions.isValue)(g00) && (0, _functions.isValue)(g10) && (row = grid[cj])) {
          var g01 = row[fi];
          var g11 = row[ci];
          if ((0, _functions.isValue)(g01) && (0, _functions.isValue)(g11)) {
            // All four points found, so interpolate the value.
            return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
          }
        }
      }
      return null;
    }
    return {
      date: date,
      interpolate: interpolate
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
    field.randomize = function (o) {
      var x = void 0;
      var y = void 0;
      var safetyNet = 0;
      do {
        x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
        y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y);
      } while (field(x, y)[2] === null && safetyNet++ < 30);
      o.x = x;
      o.y = y;
      return o;
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
            var wind = grid.interpolate(λ, φ);

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
   * Draws the particles' position to the canvas.
   */
  var draw = function draw(buckets, bounds, context) {
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
  };

  /**
   * Animates the wind visualization.
   */
  var animate = function animate(bounds, field) {
    colorScheme.indexFor = function (m) {
      // map wind speed to a style
      var len = colorScheme.length - 1;
      return Math.floor(Math.min(m, MAX_WIND_INTENSITY) / MAX_WIND_INTENSITY * len);
    };

    var buckets = colorScheme.map(Array);
    var particleCount = Math.round(bounds.width * PARTICLE_MULTIPLIER) * particleReduction;

    var particles = [];
    for (var i = 0; i < particleCount; i++) {
      particles.push(field.randomize({
        age: Math.floor(Math.random() * MAX_PARTICLE_AGE) + 0
      }));
    }

    var context = windyConfig.canvas.getContext('2d');
    context.lineWidth = particleWidth;
    context.fillStyle = 'rgba(0, 0, 0, ' + particleFadeOpacity + ')';
    var counter = 0;

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
          draw(buckets, bounds, context);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  };

  /**
   * Updates the wind animation with new configurations.
   */
  var update = function update(config) {
    var extent = config.extent();
    var width = config.width || config.element.clientWidth;
    var height = config.height || config.element.clientHeight;
    var bounds = config.bounds || [[0, 0], [width, height]];

    config.canvas.width = width;
    config.canvas.height = height;
    config.canvas.style.width = width + 'px';
    config.canvas.style.height = height + 'px';

    var mapBounds = {
      south: _math.math.deg2rad(extent[0][1]),
      north: _math.math.deg2rad(extent[1][1]),
      east: _math.math.deg2rad(extent[1][0]),
      west: _math.math.deg2rad(extent[0][0]),
      width: width,
      height: height
    };

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
    animate(builtBounds, windy.field);
  };

  /**
   * Stops and clears the wind animation.
   */
  var stop = function stop() {
    clear(windy.mapBounds);
    windy.stop = true;
    if (windy.field) windy.field.release();
  };

  var clear = function clear(bounds) {
    if (bounds) {
      var context = windyConfig.canvas.getContext('2d');
      context.clearRect(0, 0, bounds.width, bounds.height);

      if (context.resetTransform) {
        context.resetTransform();
      } else {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  };

  var windy = {};

  return { stop: stop, update: update };
};

},{"../utilities/functions":5,"../utilities/math":6}],10:[function(require,module,exports){
module.exports = require('cssify');
},{"cssify":11}],11:[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css;
    return sheet.ownerNode;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
    return style;
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode;
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
    return link;
  }
};

},{}]},{},[2]);
