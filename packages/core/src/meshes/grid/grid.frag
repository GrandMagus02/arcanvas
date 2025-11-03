#extension GL_OES_standard_derivatives : enable

precision highp float;

// No varying from vertex shader - we reconstruct world position in fragment shader

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
uniform float u_cellSize; // fixed cell size in world units
uniform float u_majorDiv; // major grid divisions (minor spacing = cellSize/majorDiv)

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
      // Ray parallel to plane, use camera position projected
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

// Antialiased line mask using pixel-distance smoothing
float aaLinePx(float dPx, float halfWidthPx) {
  return 1.0 - smoothstep(halfWidthPx, halfWidthPx + 1.0, dPx);
}

void main() {
  vec3 worldPos = getWorldPosOnPlane();
  vec2 uv, axisDist;
  getPlaneCoords(worldPos, uv, axisDist);
  
  // World units per pixel along each axis
  vec2 uvDDX = dFdx(uv);
  vec2 uvDDY = dFdy(uv);
  vec2 uvDeriv = vec2(length(uvDDX), length(uvDDY));
  uvDeriv = max(uvDeriv, vec2(1e-6));
  
  // Compute grid spacing
  float spacing;
  if (u_adaptive != 0) {
    // Adaptive spacing: snap to power of 10 based on pixel density
    float wpp = max(uvDeriv.x, uvDeriv.y);
    const float TARGET_PX_SPACING = 0.0;
    float targetWorldSpacing = TARGET_PX_SPACING * wpp;
    float logSpacing = log(max(targetWorldSpacing, 1e-6)) / log(10.0);
    float roundedLog = floor(logSpacing + 0.3);
    spacing = pow(10.0, roundedLog);
    float minCellSize = max(u_cellSize, 1e-6);
    spacing = max(spacing, minCellSize);
    spacing = max(spacing, wpp);
  } else {
    // Fixed spacing
    spacing = max(u_cellSize, 1e-6);
  }
  
  // Major and minor spacing
  float div = max(2.0, floor(u_majorDiv + 0.5));
  float majorSpacing = spacing * div;
  float minorSpacing = spacing;
  
  // Camera centering offset to reduce precision issues far from origin
  vec2 cameraOffset = vec2(0.0);
  if (u_plane == 0) {
    cameraOffset = floor(u_cameraPos.xy / div) * div;
  } else if (u_plane == 1) {
    cameraOffset = floor(u_cameraPos.xz / div) * div;
  } else {
    cameraOffset = floor(u_cameraPos.yz / div) * div;
  }
  
  vec2 centeredUV = uv - cameraOffset;
  
  // Grid line masks
  vec2 majorUVDeriv = uvDeriv / div;
  float majorLineWidth = u_majorLineWidth / div;
  // Convert to normalized grid-space width
  vec2 majorDrawWidth;
  vec2 majorLineAA;
  if (u_fixedPixelSize != 0) {
    // Fixed pixel size: convert pixel width to normalized grid-space (scales with zoom)
    majorDrawWidth = vec2(u_majorLineWidth * 2.0) * majorUVDeriv;
    majorLineAA = majorDrawWidth * 0.5;
  } else {
    // Scale with zoom: use relative width (doesn't scale with zoom)
    majorDrawWidth = clamp(vec2(majorLineWidth), majorUVDeriv, vec2(0.5));
    majorLineAA = majorUVDeriv * 1.5;
  }
  vec2 majorGridUV = 1.0 - abs(fract(centeredUV / div) * 2.0 - 1.0);
  vec2 majorAxisOffset = (1.0 - clamp(abs(axisDist / div * 2.0), 0.0, 1.0)) * 2.0;
  majorGridUV += majorAxisOffset;
  vec2 majorGrid2 = smoothstep(majorDrawWidth + majorLineAA, majorDrawWidth - majorLineAA, majorGridUV);
  majorGrid2 *= clamp(majorLineWidth / majorDrawWidth, 0.0, 1.0);
  majorGrid2 = clamp(majorGrid2, 0.0, 1.0);
  majorGrid2 = mix(majorGrid2, vec2(majorLineWidth), clamp(majorUVDeriv * 2.0 - 1.0, 0.0, 1.0));
  
  float minorLineWidth = min(u_minorLineWidth, u_majorLineWidth);
  bool minorInvertLine = minorLineWidth > 0.5;
  float minorTargetWidth = minorInvertLine ? 1.0 - minorLineWidth : minorLineWidth;
  vec2 minorDrawWidth;
  vec2 minorLineAA;
  if (u_fixedPixelSize != 0) {
    // Fixed pixel size: convert pixel width to normalized grid-space (scales with zoom)
    minorDrawWidth = vec2(minorTargetWidth * 2.0) * uvDeriv;
    minorLineAA = minorDrawWidth * 0.5;
  } else {
    // Scale with zoom: use relative width (doesn't scale with zoom)
    minorDrawWidth = clamp(vec2(minorTargetWidth), uvDeriv, vec2(0.5));
    minorLineAA = uvDeriv * 1.5;
  }
  vec2 minorGridUV = abs(fract(centeredUV) * 2.0 - 1.0);
  minorGridUV = minorInvertLine ? minorGridUV : 1.0 - minorGridUV;
  vec2 minorMajorOffset = (1.0 - clamp((1.0 - abs(fract(axisDist / div) * 2.0 - 1.0)) * div, 0.0, 1.0)) * 2.0;
  minorGridUV += minorMajorOffset;
  vec2 minorGrid2 = smoothstep(minorDrawWidth + minorLineAA, minorDrawWidth - minorLineAA, minorGridUV);
  minorGrid2 *= clamp(minorTargetWidth / minorDrawWidth, 0.0, 1.0);
  minorGrid2 = clamp(minorGrid2, 0.0, 1.0);
  minorGrid2 = mix(minorGrid2, vec2(minorTargetWidth), clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));
  minorGrid2 = minorInvertLine ? 1.0 - minorGrid2 : minorGrid2;
  vec2 axisDistAbs = abs(axisDist);
  // Only show minor grid when far from axes (both components > 0.5)
  float axisMask = step(0.5, axisDistAbs.x) * step(0.5, axisDistAbs.y);
  minorGrid2 *= axisMask;
  
  float minorGrid = mix(minorGrid2.x, 1.0, minorGrid2.y);
  float majorGrid = mix(majorGrid2.x, 1.0, majorGrid2.y);
  
  // Axis lines with dashes
  float axisLineWidth = max(u_majorLineWidth, u_axisLineWidth);
  vec2 axisDrawWidth;
  vec2 axisLineAA;
  if (u_fixedPixelSize != 0) {
    // Fixed pixel size: convert pixel width to world-space (scales with zoom)
    axisDrawWidth = vec2(axisLineWidth * 2.0) * uvDeriv;
    axisLineAA = axisDrawWidth * 0.5;
  } else {
    // Scale with zoom: use relative width (doesn't scale with zoom)
    axisDrawWidth = max(vec2(axisLineWidth), uvDeriv);
    axisLineAA = uvDeriv * 1.5;
  }
  vec2 axisLines2 = smoothstep(axisDrawWidth + axisLineAA, axisDrawWidth - axisLineAA, abs(axisDist * 2.0));
  axisLines2 *= clamp(axisLineWidth / axisDrawWidth, 0.0, 1.0);
  
  // Axis dashes
  vec2 axisDashUV = abs(fract((axisDist + axisLineWidth * 0.5) * u_axisDashScale) * 2.0 - 1.0) - 0.5;
  vec2 axisDashDeriv = uvDeriv * u_axisDashScale * 1.5;
  vec2 axisDash = smoothstep(-axisDashDeriv, axisDashDeriv, axisDashUV);
  // Show dashes only on negative side of axes
  axisDash = mix(axisDash, vec2(1.0), step(0.0, axisDist));
  
  // Select axis colors based on plane
  vec4 aAxisColor, bAxisColor, aAxisDashColor, bAxisDashColor;
  if (u_plane == 0) {
    // XY: a = X (red), b = Y (green)
    aAxisColor = u_xAxisColor;
    bAxisColor = u_yAxisColor;
    aAxisDashColor = u_xAxisDashColor;
    bAxisDashColor = u_yAxisDashColor;
  } else if (u_plane == 1) {
    // XZ: a = X (red), b = Z (blue)
    aAxisColor = u_xAxisColor;
    bAxisColor = u_zAxisColor;
    aAxisDashColor = u_xAxisDashColor;
    bAxisDashColor = u_zAxisDashColor;
  } else {
    // YZ: a = Y (green), b = Z (blue)
    aAxisColor = u_yAxisColor;
    bAxisColor = u_zAxisColor;
    aAxisDashColor = u_yAxisDashColor;
    bAxisDashColor = u_zAxisDashColor;
  }
  
  // Apply dashes and center highlight
  aAxisColor = mix(aAxisDashColor, aAxisColor, axisDash.y);
  bAxisColor = mix(bAxisDashColor, bAxisColor, axisDash.x);
  aAxisColor = mix(aAxisColor, u_centerColor, axisLines2.y);
  
  vec4 axisLines = mix(bAxisColor * axisLines2.y, aAxisColor, axisLines2.x);
  
  // Combine colors: base < minor < major < axes
  vec4 col = mix(u_baseColor, u_minorColor, minorGrid * u_minorColor.a);
  col = mix(col, u_majorColor, majorGrid * u_majorColor.a);
  col = col * (1.0 - axisLines.a) + axisLines;
  
  // Premultiplied alpha output
  float outA = clamp(col.a, 0.0, 1.0);
  vec3 outRGB = col.rgb * outA;
  gl_FragColor = vec4(outRGB, outA);
}
