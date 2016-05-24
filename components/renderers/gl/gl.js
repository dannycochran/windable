import {
  particleFrag,
  particleVert,
  rectFrag,
  rectVert
} from './shaders';

import {Renderer} from './../renderer';

export class WebGLRenderer extends Renderer {
  constructor(canvas, extent, context) {
    super(canvas, extent, context);

    this.gl = context;

    this.particlesProgram = this.createProgram_(particleVert, particleFrag);
    this.rectProgram = this.createProgram_(rectVert, rectFrag);

    this.gl.linkProgram(this.particlesProgram);
    this.gl.linkProgram(this.rectProgram);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendEquation(this.gl.FUNC_ADD);
    this.gl.disable(this.gl.DEPTH_TEST);

    canvas.addEventListener('webglcontextlost', e => this.onContextLost_(e));
    canvas.addEventListener('webglcontextrestored', e => this.onContextRestored_(e));
  }

  createProgram_(vert, frag) {
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

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.lineWidth(this.config_.particleWidth);

    return this;
  }

  draw_(buckets, bounds) {
    // Blend the existing layers.
    this.gl.blendFunc(this.gl.ZERO, this.gl.SRC_ALPHA);
    this.gl.useProgram(this.rectProgram);

    const rectLocation = this.gl.getAttribLocation(this.rectProgram, 'a_position');

    this.gl.bufferData(
        this.gl.ARRAY_BUFFER, 
        new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0]),
        this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(rectLocation);
    this.gl.vertexAttribPointer(rectLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Draw the particles.
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.useProgram(this.particlesProgram);
    const particlesBuffer = new Float32Array(this.particleVectors_);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, particlesBuffer, this.gl.STATIC_DRAW);

    const resolutionLocation = this.gl.getUniformLocation(this.particlesProgram, 'u_resolution');
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

    const positionLocation = this.gl.getAttribLocation(this.particlesProgram, 'a_position');
    const rgbaLocation = this.gl.getAttribLocation(this.particlesProgram, 'a_rgba');
    
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.enableVertexAttribArray(rgbaLocation);

    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 6  * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.vertexAttribPointer(rgbaLocation, 4, this.gl.FLOAT, false, 6  * Float32Array.BYTES_PER_ELEMENT, 8);

    this.gl.drawArrays(this.gl.LINES, 0, this.particleVectors_.length / 6);

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