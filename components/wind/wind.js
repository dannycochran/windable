import {
  debounce,
  supportsCanvas
} from '../utilities/functions';

export class WindMap {
  constructor(config) {
    this.canvas = config.canvas;
    this.data = config.data;
    this.element = config.element;
    this.getExtent = config.getExtent;

    this.drawDebounce = debounce(this.draw.bind(this), 100);
    this.windy = new Windy({canvas: config.canvas, data: config.data});

    if (!supportsCanvas()) {
      this.element.innerHTML = 'This rotary dial of a browser does not support canvas.';
    } else {
      this.draw()
    }
  }

  draw() {
    this.canvas.width = this.element.clientWidth;
    this.canvas.height = this.element.clientHeight;

    this.windy.stop();

    const extent = this.getExtent();

    this.windy.start(
      [[0,0],[this.element.clientWidth, this.element.clientHeight]],
      this.element.clientWidth,
      this.element.clientHeight,
      [[extent.xmin, extent.ymin],[extent.xmax, extent.ymax]]
    );
  }
}
