import {
  frag,
  vert
} from './shaders';

import {Renderer} from './../renderer';

export class WebGLRenderer extends Renderer {
  constructor(canvas, extent, context) {
    super(canvas, extent, context);

    this.gl = context;
    this.particlesProgram = this.constructShaders_(vert, frag);

    this.resolution = window.devicePixelRatio || 1;
    this.scale = 1;
    this.NUM_ATTRS = 6;

    this.gl.linkProgram(this.particlesProgram);
    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.BLEND);

    canvas.addEventListener('webglcontextlost', e => this.onContextLost_(e));
    canvas.addEventListener('webglcontextrestored', e => this.onContextRestored_(e));
  }

  constructShaders_(vert, frag) {
    const getShaders = (type, source) => {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      return shader;
    };

    const vertexShader = getShaders(this.gl.VERTEX_SHADER, vert);
    const fragmentShader = getShaders(this.gl.FRAGMENT_SHADER, frag);
    const shaderProgram = this.gl.createProgram();

    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    return shaderProgram;
  }

  prepare_() {
    this.clear_();
    return this;
  }

  draw_(buckets, bounds) {
    this.gl.useProgram(this.particlesProgram);

    const buffer = this.gl.createBuffer();
    const particlesBuffer = new Float32Array(this.particleVectors_);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, particlesBuffer, this.gl.STATIC_DRAW);

    const resolutionLocation = this.gl.getUniformLocation(this.particlesProgram, 'u_resolution');
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

    const positionLocation = this.gl.getAttribLocation(this.particlesProgram, 'a_position');
    const rgbaLocation = this.gl.getAttribLocation(this.particlesProgram, 'a_rgba');
    
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.enableVertexAttribArray(rgbaLocation);

    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, this.NUM_ATTRS  * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.vertexAttribPointer(rgbaLocation, 4, this.gl.FLOAT, false, this.NUM_ATTRS  * Float32Array.BYTES_PER_ELEMENT, 8);

    const lineWidthRange = this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
    const lineWidth = this.config_.particleWidth * Math.abs(this.scale * this.resolution);
    const lineWidthInRange = Math.min(Math.max(lineWidth, lineWidthRange[0]), lineWidthRange[1]);

    this.gl.lineWidth(lineWidthInRange);
    this.gl.drawArrays(this.gl.LINES, 0, this.particleVectors_.length / this.NUM_ATTRS);

    return this;
  }

  clear_() {
    super.clear_();
    this.context.clear(this.context.COLOR_BUFFER_BIT);
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