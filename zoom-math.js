/* 李垚飞 24001010723 | 任务三：页面和单元测试共用的缩放几何计算 */
(function (lyf_root, lyf_factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = lyf_factory();
  else lyf_root.lyf_zoomMath = lyf_factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  function lyf_clamp(lyf_value, lyf_min, lyf_max) { return Math.min(lyf_max, Math.max(lyf_min, lyf_value)); }
  function lyf_fitSize(lyf_naturalWidth, lyf_naturalHeight, lyf_width, lyf_height) {
    var lyf_ratio = Math.min(lyf_width / lyf_naturalWidth, lyf_height / lyf_naturalHeight);
    return { width: lyf_naturalWidth * lyf_ratio, height: lyf_naturalHeight * lyf_ratio };
  }
  function lyf_limit(lyf_state, lyf_geometry) {
    var lyf_scale = lyf_clamp(lyf_state.scale, 1, 4);
    var lyf_maxX = Math.max(0, (lyf_geometry.baseWidth * lyf_scale - lyf_geometry.width) / 2);
    var lyf_maxY = Math.max(0, (lyf_geometry.baseHeight * lyf_scale - lyf_geometry.height) / 2);
    return {scale:lyf_scale, x:lyf_scale === 1 ? 0 : lyf_clamp(lyf_state.x,-lyf_maxX,lyf_maxX), y:lyf_scale === 1 ? 0 : lyf_clamp(lyf_state.y,-lyf_maxY,lyf_maxY)};
  }
  // 先求手指中点所指的图像坐标，再反算新位移：这个图像点始终跟着两指中点。
  function lyf_zoomAt(lyf_start, lyf_from, lyf_to, lyf_targetScale, lyf_geometry) {
    var lyf_scale = lyf_clamp(lyf_targetScale, 1, 4);
    var lyf_ratio = lyf_scale / lyf_start.scale;
    return lyf_limit({scale:lyf_scale, x:lyf_to.x-(lyf_from.x-lyf_start.x)*lyf_ratio, y:lyf_to.y-(lyf_from.y-lyf_start.y)*lyf_ratio},lyf_geometry);
  }
  function lyf_resizeState(lyf_state, lyf_old, lyf_next) {
    return lyf_limit({scale:lyf_state.scale, x:lyf_state.x*lyf_next.baseWidth/lyf_old.baseWidth, y:lyf_state.y*lyf_next.baseHeight/lyf_old.baseHeight},lyf_next);
  }
  return {lyf_clamp:lyf_clamp,lyf_fitSize:lyf_fitSize,lyf_limit:lyf_limit,lyf_zoomAt:lyf_zoomAt,lyf_resizeState:lyf_resizeState};
});
