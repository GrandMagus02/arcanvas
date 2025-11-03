precision mediump float;

attribute vec2 a_position; // clip-space positions for a fullscreen triangle

void main() {
  // Fullscreen triangle in clip space: (-1,-1), (3,-1), (-1,3)
  gl_Position = vec4(a_position, 0.0, 1.0);
}
