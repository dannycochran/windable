/**
 * A light controller class for using a modified version of Esri's Windy.JS.
 */

import {CanvasRenderer} from './../renderers/canvas/canvas';
import {debounce} from './../utilities/functions';
import {WebGLRenderer} from './../renderers/gl/gl';

export class WindMap {
  /**
   * A constructor for the WindMap. See typedefs.js for a description of
   * ConfigPayload.
   *
   * @param {!ConfigPayload} config An instance of ConfigPayload.
   */
  constructor(config) {
    const contextType = config.contextType || getContextType();
    const context = config.canvas.getContext(contextType);

    if (contextType.indexOf('2d') > -1) {
      this.renderer = new CanvasRenderer(config.canvas, config.extent, context);
    } else if (contextType.indexOf('webgl') > -1) {
      this.renderer = new WebGLRenderer(config.canvas, config.extent, context);
    }

    this.startRenderer_ = debounce((config) => {
      this.renderer.start(config);
    });

    function getContextType() {
      for (let type of ['webgl-2d', 'webgl', 'webgl-experimental', '2d']) {
        if (config.canvas.getContext(type)) {
          return type;
        }
      }
    };
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
