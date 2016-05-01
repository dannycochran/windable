/**
 * A light controller class for using a modified version of Esri's Windy.JS.
 */

import {debounce} from '../utilities/functions';
import {palettes} from '../utilities/palettes';
import {
  Windy,
  getContext
} from './windy';

export class WindMap {
  /**
   * A constructor for the WindMap. See typedefs.js for a description of
   * ConfigPayload.
   *
   * @param {!ConfigPayload} config An instance of ConfigPayload.
   */
  constructor(config) {
    if (!getContext(config.canvas)) {
      throw new Error('Browser does not support canvas.');
    }

    // Required configuration fields.
    this.config_ = {
      canvas: config.canvas,
      extent: config.extent,
      data: config.data,
      colorScheme: config.colorScheme || palettes.Purples
    };

    this.palettes = palettes;
    this.windy_ = new Windy({canvas: config.canvas});
    this.startWindy_ = debounce(() => {
      this.windy_.start(this.config_);
    });

    this.update(config);
  }

  stop() {
    this.windy_.stop();
    return this;
  }

  start() {
    this.startWindy_();
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
}
