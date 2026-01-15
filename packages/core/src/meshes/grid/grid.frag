#extension GL_OES_standard_derivatives : enable

precision highp float;

// Plane selection: 0 = XY, 1 = XZ, 2 = YZ
uniform int u_plane;

// Inverse view-projection matrix (for world reconstruction)
uniform mat4 u_invViewProj;

// Viewport size in pixels
uniform vec2 u_viewportPx;

// Camera position in world space
uniform vec3 u_cameraPos;

// Spacing control
uniform int u_adaptive; // 1 = adaptive, 0 = fixed
uniform float u_cellSize; // fixed cell size in world units (base size)
uniform float u_majorDiv; // major grid divisions (every Nth line is major)
uniform float u_minCellPixelSize; // minimum visual size in pixels before collapsing

// Line widths (pixels)
uniform float u_axisLineWidth;
uniform float u_majorLineWidth;
uniform float u_minorLineWidth;
uniform float u_axisDashScale;
uniform int u_fixedPixelSize; // 1 = fixed pixel size (ignore zoom), 0 = scale with zoom

// Colors (linear RGB, non-premultiplied; we premultiply in shader)
uniform vec4 u_baseColor;
uniform vec4 u_minorColor;
uniform vec4 u_majorColor;
uniform vec4 u_xAxisColor;
uniform vec4 u_xAxisDashColor;
uniform vec4 u_yAxisColor;
uniform vec4 u_yAxisDashColor;
uniform vec4 u_zAxisColor;
uniform vec4 u_zAxisDashColor;
uniform vec4 u_centerColor;

// Reconstruct world position on the selected plane from fragment coordinates
vec3 getWorldPosOnPlane() {
  // Convert fragment coordinates to NDC [-1, 1]
  vec2 ndc = vec2(
    (gl_FragCoord.x / u_viewportPx.x) * 2.0 - 1.0,
    (gl_FragCoord.y / u_viewportPx.y) * 2.0 - 1.0
  );
  
  // Unproject near and far points
  vec4 nearClip = vec4(ndc, -1.0, 1.0);
  vec4 farClip = vec4(ndc, 1.0, 1.0);
  
  vec4 nearWorld = u_invViewProj * nearClip;
  vec4 farWorld = u_invViewProj * farClip;
  
  nearWorld /= nearWorld.w;
  farWorld /= farWorld.w;
  
  vec3 rayDir = normalize(farWorld.xyz - nearWorld.xyz);
  vec3 rayOrigin = nearWorld.xyz;
  
  // Intersect ray with selected plane
  float t;
  vec3 worldPos;
  
  if (u_plane == 0) {
    // XY plane (z = 0)
    if (abs(rayDir.z) < 1e-6) {
      worldPos = vec3(rayOrigin.xy, 0.0);
    } else {
      t = -rayOrigin.z / rayDir.z;
      worldPos = rayOrigin + rayDir * t;
    }
  } else if (u_plane == 1) {
    // XZ plane (y = 0)
    if (abs(rayDir.y) < 1e-6) {
      worldPos = vec3(rayOrigin.xz, 0.0).xzy;
    } else {
      t = -rayOrigin.y / rayDir.y;
      worldPos = rayOrigin + rayDir * t;
    }
  } else {
    // YZ plane (x = 0)
    if (abs(rayDir.x) < 1e-6) {
      worldPos = vec3(rayOrigin.yz, 0.0).yxz;
    } else {
      t = -rayOrigin.x / rayDir.x;
      worldPos = rayOrigin + rayDir * t;
    }
  }
  
  return worldPos;
}

// Get plane UV coordinates and axis distances based on selected plane
void getPlaneCoords(vec3 worldPos, out vec2 uv, out vec2 axisDist) {
  if (u_plane == 0) {
    // XY plane: uv = (x, y), axisDist = (x, y)
    uv = worldPos.xy;
    axisDist = worldPos.xy;
  } else if (u_plane == 1) {
    // XZ plane: uv = (x, z), axisDist = (x, z)
    uv = worldPos.xz;
    axisDist = worldPos.xz;
  } else {
    // YZ plane: uv = (y, z), axisDist = (y, z)
    uv = worldPos.yz;
    axisDist = worldPos.yz;
  }
}

// Compute grid line intensity for a given spacing
float gridLayer(vec2 uv, float spacing, float lineWidthPx, vec2 wpp) {
  // Distance to nearest grid line in world units
  vec2 dist = abs(fract(uv / spacing + 0.5) - 0.5) * spacing;
  
  // Target visual width in pixels
  // If u_fixedPixelSize is true, lineWidthPx is pixels.
  // If false, it's world units (but we treat it as pixels for simplicity in this path for now)
  // Let's strictly follow the request: "ensure that lines are not change on zoom level"
  // So we always interpret u_...LineWidth as pixels.
  
  float targetWidthWorld = lineWidthPx * max(wpp.x, wpp.y); // Approximate width in world
  // Better: calculate per-axis width
  vec2 targetWidthWorldVec = lineWidthPx * wpp;
  
  // Smoothstep for AA
  // We want the line to be 1.0 at dist=0 and fade out at dist=targetWidthWorld/2
  // Standard AA: smoothstep(width/2 + aa, width/2 - aa, dist)
  // AA width is typically 1 pixel = wpp
  
  vec2 aaWidth = wpp; // 1 pixel blur
  vec2 halfWidth = targetWidthWorldVec * 0.5;
  
  vec2 gridVec = smoothstep(halfWidth + aaWidth, halfWidth - aaWidth, dist);
  
  return max(gridVec.x, gridVec.y);
}

void main() {
  vec3 worldPos = getWorldPosOnPlane();
  vec2 uv, axisDist;
  getPlaneCoords(worldPos, uv, axisDist);
  
  // World units per pixel (derivative)
  vec2 uvDDX = dFdx(uv);
  vec2 uvDDY = dFdy(uv);
  vec2 wpp = vec2(length(uvDDX), length(uvDDY)); // World Per Pixel
  wpp = max(wpp, vec2(1e-6));
  
  // Adaptive Spacing Logic
  float spacing = u_cellSize;
  if (u_adaptive != 0) {
    float maxWpp = max(wpp.x, wpp.y);
    float minWorldSpacing = u_minCellPixelSize * maxWpp;
    
    // We want spacing = base * 2^n >= minWorldSpacing
    // 2^n >= minWorldSpacing / base
    // n >= log2(minWorldSpacing / base)
    
    float n = ceil(log2(max(minWorldSpacing / max(spacing, 1e-6), 1e-6)));
    // Ensure we don't go below base spacing if min pixel size is small
    n = max(n, 0.0);
    
    spacing = spacing * pow(2.0, n);
  }
  
  // Major lines are every N * spacing
  float div = max(2.0, floor(u_majorDiv + 0.5));
  float majorSpacing = spacing * div;
  
  // Draw Minor Grid
  float minorInt = gridLayer(uv, spacing, u_minorLineWidth, wpp);
  
  // Draw Major Grid
  float majorInt = gridLayer(uv, majorSpacing, u_majorLineWidth, wpp);
  
  // Combine Minor and Major
  // Major lines should overwrite minor lines, or be blended.
  // Since they align, max() works well.
  
  vec4 minorCol = u_minorColor;
  vec4 majorCol = u_majorColor;
  
  // Base color
  vec4 col = u_baseColor;
  
  // Blend minor
  col = mix(col, minorCol, minorInt * minorCol.a);
  
  // Blend major
  col = mix(col, majorCol, majorInt * majorCol.a);
  
  // Axis Lines
  // X axis corresponds to Y=0 (or Z=0), i.e., second component of uv is 0.
  // Y axis corresponds to X=0 (or Y=0), i.e., first component of uv is 0.
  
  // Draw Axis lines
  // Axis width
  float axisWidthPx = u_axisLineWidth;
  
  vec2 axisDistAbs = abs(axisDist);
  vec2 axisTargetWidth = axisWidthPx * wpp;
  vec2 axisAA = wpp;
  
  vec2 axisInt = smoothstep(axisTargetWidth * 0.5 + axisAA, axisTargetWidth * 0.5 - axisAA, axisDistAbs);
  
  // Select axis colors
  vec4 xColor = u_xAxisColor;
  vec4 yColor = u_yAxisColor; // Or Z depending on plane
  
  if (u_plane == 1) { // XZ plane
    yColor = u_zAxisColor;
  } else if (u_plane == 2) { // YZ plane
    xColor = u_yAxisColor;
    yColor = u_zAxisColor;
  }
  
  // Dashed patterns for negative axes?
  // User didn't strictly request dashes, but "axis lines - like red and green".
  // Keeping simple solid lines for axes as per "like red and green". 
  // If we want negative dashes, we can add check for axisDist < 0.
  
  // Blend axes
  // "y-axis" is the line where x=0 (axisDist.x=0). So axisInt.x is the vertical line intensity.
  // "x-axis" is the line where y=0 (axisDist.y=0). So axisInt.y is the horizontal line intensity.
  
  // Note: standard naming confusion. 
  // The line x=0 is the Y-axis (or Z-axis). It has color of Y-axis.
  // The line y=0 is the X-axis. It has color of X-axis.
  
  // Vertical line (x=0) -> Y/Z axis color
  col = mix(col, yColor, axisInt.x * yColor.a);
  
  // Horizontal line (y=0) -> X/Y axis color
  col = mix(col, xColor, axisInt.y * xColor.a);
  
  // Center highlight?
  // Optional, but good for visibility.
  float centerInt = min(axisInt.x, axisInt.y);
  col = mix(col, u_centerColor, centerInt * u_centerColor.a);

  // Premultiply alpha
  gl_FragColor = vec4(col.rgb * col.a, col.a);
}
