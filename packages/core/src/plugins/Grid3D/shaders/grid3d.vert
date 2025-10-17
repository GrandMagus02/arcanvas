attribute vec3 a_position;
uniform mat4 u_viewProj;

varying vec3 v_world;

void main() {
  v_world = a_position; // model matrix is identity for the grid plane
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}
