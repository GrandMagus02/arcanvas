attribute vec3 a_position;
uniform mat4 u_projection;

void main() {
  vec4 pos = u_projection * vec4(a_position.x, a_position.y, a_position.z, 1.0);
  gl_Position = pos;
}

