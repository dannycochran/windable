/**
 * A light controller class for using a modified version of Esri's Windy.JS.
 */

import {debounce} from '../utilities/functions';

import {getContextType} from './../renderers/renderer';
import {WebGLRenderer} from './../renderers/gl/gl';
import {CanvasRenderer} from './../renderers/canvas/canvas';

export class WindMap {
  /**
   * A constructor for the WindMap. See typedefs.js for a description of
   * ConfigPayload.
   *
   * @param {!ConfigPayload} config An instance of ConfigPayload.
   */
  constructor(config) {
    const contextType = getContextType(config.canvas);
    if (contextType.indexOf('webgl') > -1) {
      this.renderer = new WebGLRenderer(config.canvas, config.extent);
    } else if (contextType === '2d') {
      this.renderer = new CanvasRenderer(config.canvas, config.extent);
    }

    this.startRenderer_ = debounce((config) => {
      this.renderer.start(config);
    });
  }


  /**
   * Stop the WindMap animation.
   * @return {!WindMap} The windmap instance.
   */
  stop() {
    this.renderer.stop();
    return this;
  }


  /**
   * Start the WindMap animation.
   * @param {!ConfigPayload=} config An instance of ConfigPayload.
   * @return {!WindMap} The windmap instance.
   */
  start(config={}) {
    this.startRenderer_(config);
    return this;
  }


  /**
   * Update the WindMap data and its optional configurations.
   * @param {!ConfigPayload=} config An instance of ConfigPayload.
   * @return {!WindMap} The windmap instance.
   */
  update(config={}) {
    return this.stop().start(config);
  }
};
