import {formatTime} from '../utilities/functions';

/**
 * Stores altitude data.
 */
export class AltitudeModel {
  /**
   * Constructs an altitude model with optional configuration
   * @param {Object=} settings Optional settings:
   *  {
   *    data: A hash of existing wind data.
   *    levels: An array of discrete millibar levels.
   *    millibars: The starting selected millibars level.
   *  }
   */
  constructor(settings={}) {
    this.data = settings.data || {};
    this.levels = settings.levels ||
      [200, 250, 300, 400, 500, 700, 850, 925, 1000];
    this.millibars = settings.millibars || this.levels[8];
  }


  /**
   * Creates a key hash from a config object.
   * @param {Object=} config An optional config object:
   *  {time: string|Date, millibars: number}
   * @return {!Promise} A promise.
   */
  get(config={}) {
    config = Object.assign({
      time: new Date(),
      millibars: this.millibars
    }, config);

    if (config.time instanceof Date) {
      config.time = formatTime(config.time);
    }

    const key = this.key(config);

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
  key(config) {
    return JSON.stringify(config);
  }


  /**
   * Fetches wind data based on a time and millibar level. Uses browser fetch.
   * Override window.fetch with your own Promise if browser support is an issue.
   * @param {!Object} config A config object:
   *  {time: string, millibars: number}
   * @return {!Promise} A promise.
   */
  fetch(config) {
    return fetch(this.url(config), {method: 'get'})
      .then(response => response.json())
      .then(json => json)
      .catch(err => Promise.resolve(err));
  }


  /**
   * URL from which to fetch data.
   * @param {!Object} config A config object:
   *  {time: string, millibars: number}
   * @return {string} A url string.
   */
   url(config) {
    return `/wind?time=${config.time}&millibars=${config.millibars}`
   }
};
