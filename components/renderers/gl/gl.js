import {shaders} from './shaders';
import {Renderer} from './../renderer';

export class WebGLRenderer extends Renderer {
  constructor(canvas, extent) {
    super(canvas, extent);

    canvas.addEventListener('webglcontextlost', e => this.onContextLost_(e));
    canvas.addEventListener('webglcontextrestored', e => this.onContextRestored_(e));
  }

  prepare_() {
    return this.resize_();
  }

  draw_(buckets, bounds) {
    return this;
  }

  clear_() {
    super.clear_();
    if (!this.mapBounds_) return;

    this.context.clear(this.context.COLOR_BUFFER_BIT);
    return this.resize_();
  }

  resize_(context) {
    this.context.viewport(0, 0, this.context.drawingBufferWidth, this.context.drawingBufferHeight);
    return this;
  }

  onContextLost_(e) {
    e.preventDefault();
    this.stopped_ = true;
    this.clear_();
  }

  onContextRestored_(e) {
    this.clear_().start_();
  }
};