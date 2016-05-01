export const frag = ' \
  precision mediump float; \
  varying vec4 rgba; \
  void main() { \
    gl_FragColor = rgba; \
  }';

export const vert = ' \
  uniform vec2 u_resolution; \
  attribute vec2 a_position; \
  attribute vec4 a_rgba; \
  varying vec4 rgba; \
  void main() { \
    vec2 clipspace = a_position / u_resolution * 2.0 - 1.0; \
    gl_Position = vec4(clipspace * vec2(1, -1), 0, 1); \
    rgba = a_rgba / 255.0; \
  }';