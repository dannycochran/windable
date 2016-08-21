/**
 * A light controller class for using a modified version of Earth.nullschool.
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
    const context = getContextType();

    if (context.type.indexOf('2d') > -1) {
      this.renderer = new CanvasRenderer(config.canvas, config.extent, context.renderer);
    } else if (context.type.indexOf('webgl') > -1) {
      this.renderer = new WebGLRenderer(config.canvas, config.extent, context.renderer);
    }

    this.debounceStart_ = debounce((config) => {
      this.renderer.start_(config);
    });

    function getContextType() {
      for (let type of ['webgl', 'webgl-experimental', '2d']) {
        const context = {
          type: type,
          renderer: config.canvas.getContext(type, {preserveDrawingBuffer: true})
        };
        if (context.renderer) {
          return context;
        }
      }
    };
  }


  /**
   * Stops the WindMap animation.
   * @return {!WindMap} The windmap instance.
   */
  stop() {
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
  start(config={}, renderImmediately=false) {
    if (renderImmediately) this.renderer.start_(config);
    else this.debounceStart_(config);

    return this;
  }


  /**
   * Updates the WindMap data and its optional configurations.
   * @param {!ConfigPayload=} config An instance of ConfigPayload.
   * @param {boolean=} renderImmediately Whether to render immediately instead
   *    of debouncing.
   * @return {!WindMap} The windmap instance.
   */
  update(config={}, renderImmediately=false) {
    return this.stop().start(config, renderImmediately);
  }
};
