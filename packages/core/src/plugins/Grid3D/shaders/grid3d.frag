precision mediump float;

uniform vec4 u_color;
uniform float u_spacing;
uniform int u_axes;

varying vec3 v_world;

// Simple grid without derivatives: thickness in world units
float lineMask(vec2 coord, float halfWidth){
  vec2 c = abs(fract(coord) - 0.5);
  float gx = step(c.x, halfWidth);
  float gy = step(c.y, halfWidth);
  return clamp(gx + gy, 0.0, 1.0);
}

void main(){
  vec2 coord = v_world.xz / u_spacing;
  // Half thickness as a fraction of spacing
  float halfWidth = 0.02; // 2% of spacing
  float line = lineMask(coord, halfWidth);

  float axisX = 0.0;
  float axisZ = 0.0;
  if (u_axes == 1) {
    float axisHalf = u_spacing * 0.02;
    axisX = step(abs(v_world.z), axisHalf);
    axisZ = step(abs(v_world.x), axisHalf);
  }

  float visible = max(line, max(axisX, axisZ));
  if (visible < 0.5) discard;

  vec3 col = u_color.rgb;
  if (axisX > 0.5) col = vec3(1.0, 0.1, 0.1);
  if (axisZ > 0.5) col = vec3(0.1, 0.1, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
