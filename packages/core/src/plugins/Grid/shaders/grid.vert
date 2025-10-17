attribute vec2 a_position;
uniform vec2 u_resolution;
uniform float u_scale;
uniform vec2 u_translation;

void main() {
  vec2 screen = a_position * u_scale + u_translation;
  vec2 zeroToOne = screen / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clip = zeroToTwo - 1.0;
  gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
}

