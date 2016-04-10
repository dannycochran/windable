import {
  debounce,
  supportsCanvas
} from '../utilities/functions';
import {Windy} from './windy';

export class WindMap {
  constructor(config) {
    this.canvas = config.canvas;
    this.data = config.data;
    this.element = config.element;
    this.getExtent = config.getExtent;

    this.startDebounce_ = debounce(this.draw_.bind(this));
    this.windy_ = new Windy({
      canvas: config.canvas,
      data: config.data
    });

    if (!supportsCanvas()) {
      this.element.innerHTML = 'This rotary dial of a browser does not support canvas.';
    } else {
      this.start();
    }
  }

  stop() {
    this.windy_.stop();
  }

  start() {
    this.stop();
    this.startDebounce_();
  }

  update(data) {
    this.stop();
    this.windy_.update(data);
    this.startDebounce_();
  }

  draw_() {
    this.canvas.width = this.element.clientWidth;
    this.canvas.height = this.element.clientHeight;
    this.canvas.style.width = this.element.clientWidth + 'px';
    this.canvas.style.height = this.element.clientHeight + 'px';
    this.stop();

    const extent = this.getExtent();

    this.windy_.start(
      [[0,0],[this.element.clientWidth, this.element.clientHeight]],
      this.element.clientWidth,
      this.element.clientHeight,
      [[extent.xmin, extent.ymin],[extent.xmax, extent.ymax]]
    );
  }
}
