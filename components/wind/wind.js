/**
 * A light controller class for using a modified version of Esri's Windy.JS.
 */

import {
  debounce,
  supportsCanvas
} from '../utilities/functions';

import {Windy} from './windy';

export class WindMap {
  /**
   * A constructor for the WindMap. See typedefs.js for a description of
   * ConfigPayload.
   *
   * @param {!ConfigPayload} config An instance of ConfigPayload.
   */
  constructor(config) {
    if (!supportsCanvas()) {
      throw new Error(`Browser does not support canvas.`);
    }

    // Required configuration fields.
    this.config_ = {
      canvas: config.canvas,
      extent: config.extent,
      data: config.data || {},
    };

    this.windy_ = new Windy({canvas: config.canvas});
    this.updateWindy_ = debounce(() => {
      this.windy_.update(this.config_);
    });

    this.update(config);
  }

  stop() {
    this.windy_.stop();
    return this;
  }

  /**
   * Update the WindMap data and its optional configurations.
   * @param {!Object} config Extends the existing ConfigPayload for this class.
   * @return {!WindMap} The windmap instance.
   */
  update(config={}) {
    this.stop();

    // Optional configuration fields. These all have default values in Windy.
    Object.assign(this.config_, {
      colorScheme: config.colorScheme,
      velocityScale: config.velocityScale,
      particleWidth: config.particleWidth,
      particleFadeOpacity: config.particleFadeOpacity,
      particleReduction: config.particleReduction
    });

    // Update the wind data if it exists.
    this.config_.data = config.data || this.config_.data;

    this.updateWindy_();
    return this;
  }
}
