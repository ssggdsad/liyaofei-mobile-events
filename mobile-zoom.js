/* 姓名：李垚飞 | 学号：24001010723 | 任务三
 * 阅读顺序：尺寸与边界 → 两指缩放 → 单指拖动 → 双击 → 取消与横竖屏。
 * 不使用轮播库；touchstart/move/end/cancel 都在这里真实处理。
 */
(function () {
  'use strict';
  var lyf_stage = document.getElementById('lyf_zoom_stage');
  var lyf_image = document.getElementById('lyf_zoom_image');
  var lyf_output = document.getElementById('lyf_scale');
  var lyf_status = document.getElementById('lyf_zoom_status');
  var lyf_out = document.getElementById('lyf_zoom_out');
  var lyf_in = document.getElementById('lyf_zoom_in');
  var lyf_reset = document.getElementById('lyf_zoom_reset');
  var lyf_math = window.lyf_zoomMath;
  var lyf_state = {scale:1,x:0,y:0};
  var lyf_geometry = null;
  var lyf_gesture = null;
  var lyf_lastTap = null;
  var lyf_hadMulti = false;
  var lyf_lastTouchTime = 0;
  var lyf_mouse = null;
  var lyf_resizeTimer = null;

  function lyf_render(lyf_animated) {
    lyf_image.style.transition = lyf_animated ? 'transform 0.25s ease' : 'none';
    lyf_image.style.transform = 'translate(' + lyf_state.x + 'px,' + lyf_state.y + 'px) scale(' + lyf_state.scale + ')';
    lyf_output.textContent = lyf_state.scale.toFixed(2) + ' ×';
    lyf_out.disabled = lyf_state.scale <= 1;
    lyf_in.disabled = lyf_state.scale >= 4;
    lyf_stage.style.cursor = lyf_state.scale > 1 ? 'grab' : 'default';
  }
  function lyf_measure() {
    if (!lyf_image.naturalWidth || !lyf_stage.clientWidth) return;
    var lyf_size = lyf_math.lyf_fitSize(lyf_image.naturalWidth,lyf_image.naturalHeight,lyf_stage.clientWidth,lyf_stage.clientHeight);
    var lyf_next = {width:lyf_stage.clientWidth,height:lyf_stage.clientHeight,baseWidth:lyf_size.width,baseHeight:lyf_size.height};
    lyf_state = lyf_geometry ? lyf_math.lyf_resizeState(lyf_state,lyf_geometry,lyf_next) : lyf_state;
    lyf_geometry = lyf_next;
    lyf_image.style.width = lyf_size.width + 'px';
    lyf_image.style.height = lyf_size.height + 'px';
    lyf_image.style.marginLeft = -lyf_size.width/2 + 'px';
    lyf_image.style.marginTop = -lyf_size.height/2 + 'px';
    lyf_gesture = null; lyf_lastTap = null; lyf_mouse = null; lyf_hadMulti = false;
    lyf_render(false);
  }
  // touches包含整屏手指；只接管起始于本操作区（含图片子元素）的触点。
  function lyf_localTouches(lyf_event) {
    return Array.from(lyf_event.touches).filter(function (lyf_touch) { return lyf_stage.contains(lyf_touch.target); });
  }
  // 动画还没结束就再按下时，接管当前可见矩阵，而不是突然跳到逻辑终点。
  function lyf_captureVisible() {
    var lyf_matrix = new DOMMatrix(getComputedStyle(lyf_image).transform);
    lyf_state = lyf_math.lyf_limit({scale:Math.hypot(lyf_matrix.a,lyf_matrix.b),x:lyf_matrix.e,y:lyf_matrix.f},lyf_geometry);
    lyf_render(false);
  }
  // 手指坐标统一换算为“相对容器中心”，不受页面滚动位置影响。
  function lyf_point(lyf_touch) {
    var lyf_rect = lyf_stage.getBoundingClientRect();
    return {x:lyf_touch.clientX-lyf_rect.left-lyf_rect.width/2,y:lyf_touch.clientY-lyf_rect.top-lyf_rect.height/2};
  }
  function lyf_distance(lyf_a,lyf_b) { return Math.hypot(lyf_a.clientX-lyf_b.clientX,lyf_a.clientY-lyf_b.clientY); }
  function lyf_middle(lyf_a,lyf_b) { return lyf_point({clientX:(lyf_a.clientX+lyf_b.clientX)/2,clientY:(lyf_a.clientY+lyf_b.clientY)/2}); }
  function lyf_findTouch(lyf_touches,lyf_id) { return Array.from(lyf_touches).find(function (lyf_t) { return lyf_t.identifier === lyf_id; }); }
  function lyf_beginPan(lyf_touch,lyf_blockTap) {
    lyf_gesture = {mode:'pan',id:lyf_touch.identifier,start:lyf_point(lyf_touch),state:Object.assign({},lyf_state),time:Date.now(),moved:false,blockTap:lyf_blockTap};
  }
  function lyf_beginPinch(lyf_touches) {
    lyf_hadMulti = true; lyf_lastTap = null;
    // 第三指加入时不重设现有的两指基准；依据identifier找原来的手指，避免顺序变化。
    if (lyf_gesture && lyf_gesture.mode === 'pinch' && lyf_findTouch(lyf_touches,lyf_gesture.ids[0]) && lyf_findTouch(lyf_touches,lyf_gesture.ids[1])) return;
    lyf_gesture = {mode:'pinch',ids:[lyf_touches[0].identifier,lyf_touches[1].identifier],distance:Math.max(1,lyf_distance(lyf_touches[0],lyf_touches[1])),center:lyf_middle(lyf_touches[0],lyf_touches[1]),state:Object.assign({},lyf_state)};
  }
  function lyf_toggle(lyf_at) {
    lyf_state = lyf_math.lyf_zoomAt(lyf_state,lyf_at,lyf_at,lyf_state.scale > 1 ? 1 : 2,lyf_geometry);
    lyf_render(true);
    lyf_status.textContent = lyf_state.scale === 1 ? '已还原 · 图片自动居中' : '已放大至 2 倍 · 单指拖动查看细节';
  }
  lyf_stage.addEventListener('touchstart',function (lyf_event) {
    if (!lyf_geometry) return;
    var lyf_touches = lyf_localTouches(lyf_event);
    if (!lyf_touches.length) return;
    lyf_captureVisible();
    if (lyf_event.cancelable) lyf_event.preventDefault();
    lyf_lastTouchTime = Date.now(); lyf_mouse = null;
    if (lyf_touches.length >= 2) lyf_beginPinch(lyf_touches);
    else if (lyf_touches.length === 1) { lyf_hadMulti = false; lyf_beginPan(lyf_touches[0],false); }
    lyf_image.style.transition = 'none';
  },{passive:false});

  lyf_stage.addEventListener('touchmove',function (lyf_event) {
    if (!lyf_gesture || !lyf_geometry) return;
    var lyf_touches = lyf_localTouches(lyf_event);
    if (lyf_event.cancelable) lyf_event.preventDefault();
    if (lyf_touches.length >= 2) {
      lyf_beginPinch(lyf_touches);
      var lyf_a = lyf_findTouch(lyf_touches,lyf_gesture.ids[0]);
      var lyf_b = lyf_findTouch(lyf_touches,lyf_gesture.ids[1]);
      // 与touchstart时的距离比较，而不是每帧累乘，防止误差和缩放跳变。
      var lyf_target = lyf_gesture.state.scale * lyf_distance(lyf_a,lyf_b) / lyf_gesture.distance;
      lyf_state = lyf_math.lyf_zoomAt(lyf_gesture.state,lyf_gesture.center,lyf_middle(lyf_a,lyf_b),lyf_target,lyf_geometry);
    } else if (lyf_gesture.mode === 'pan' && lyf_touches.length === 1) {
      var lyf_t = lyf_findTouch(lyf_touches,lyf_gesture.id);
      if (!lyf_t) return;
      var lyf_now = lyf_point(lyf_t);
      var lyf_dx = lyf_now.x-lyf_gesture.start.x, lyf_dy = lyf_now.y-lyf_gesture.start.y;
      if (Math.hypot(lyf_dx,lyf_dy) > 8) { lyf_gesture.moved = true; lyf_lastTap = null; }
      lyf_state = lyf_math.lyf_limit({scale:lyf_gesture.state.scale,x:lyf_gesture.state.x+lyf_dx,y:lyf_gesture.state.y+lyf_dy},lyf_geometry);
    }
    lyf_render(false);
  },{passive:false});

  lyf_stage.addEventListener('touchend',function (lyf_event) {
    if (!lyf_geometry) return;
    var lyf_touches = lyf_localTouches(lyf_event);
    if (lyf_event.cancelable) lyf_event.preventDefault();
    var lyf_before = lyf_gesture;
    if (lyf_touches.length >= 2) { lyf_beginPinch(lyf_touches); return; }
    if (lyf_touches.length === 1) {
      // 捏合松开一指后，以“当前图片位置+剩余手指位置”重设拖动基准，所以不会跳。
      lyf_beginPan(lyf_touches[0],true); lyf_lastTap = null; return;
    }
    var lyf_didToggle = false;
    // 抬手的手指不在touches里，要从changedTouches读取最终坐标。
    if (lyf_before && lyf_before.mode === 'pan' && !lyf_before.moved && !lyf_before.blockTap && !lyf_hadMulti && Date.now()-lyf_before.time < 260) {
      var lyf_ended = lyf_findTouch(lyf_event.changedTouches,lyf_before.id);
      if (lyf_ended) {
        var lyf_endPoint = lyf_point(lyf_ended);
        if (Math.hypot(lyf_endPoint.x-lyf_before.start.x,lyf_endPoint.y-lyf_before.start.y) < 12) {
          var lyf_time = Date.now();
          if (lyf_lastTap && lyf_time-lyf_lastTap.time < 300 && Math.hypot(lyf_endPoint.x-lyf_lastTap.point.x,lyf_endPoint.y-lyf_lastTap.point.y) < 24) {
            lyf_toggle(lyf_endPoint); lyf_lastTap = null; lyf_didToggle = true;
          } else lyf_lastTap = {time:lyf_time,point:lyf_endPoint};
        } else lyf_lastTap = null;
      }
    } else lyf_lastTap = null;
    lyf_gesture = null; lyf_hadMulti = false;
    lyf_state = lyf_math.lyf_limit(lyf_state,lyf_geometry);
    if (!lyf_didToggle) { lyf_render(false); lyf_status.textContent = lyf_state.scale === 1 ? '原图居中 · 放大后可以拖动' : '当前 '+lyf_state.scale.toFixed(2)+' 倍 · 拖动受边界限制'; }
  },{passive:false});
  lyf_stage.addEventListener('touchcancel',function () {
    if (!lyf_geometry) return;
    lyf_gesture = null; lyf_lastTap = null; lyf_hadMulti = false;
    lyf_state = lyf_math.lyf_limit(lyf_state,lyf_geometry); lyf_render(false);
    lyf_status.textContent = '手势已中断 · 可以重新操作';
  },{passive:true});

  function lyf_changeScale(lyf_delta) {
    if (!lyf_geometry) return;
    lyf_gesture = null; lyf_lastTap = null;
    lyf_state = lyf_math.lyf_zoomAt(lyf_state,{x:0,y:0},{x:0,y:0},lyf_state.scale+lyf_delta,lyf_geometry);
    lyf_render(true); lyf_status.textContent = lyf_state.scale === 1 ? '已还原 · 图片自动居中' : '当前 '+lyf_state.scale.toFixed(2)+' 倍 · 拖动查看细节';
  }
  lyf_in.addEventListener('click',function () { lyf_changeScale(.5); });
  lyf_out.addEventListener('click',function () { lyf_changeScale(-.5); });
  lyf_reset.addEventListener('click',function () {
    lyf_state = {scale:1,x:0,y:0}; lyf_gesture = null; lyf_lastTap = null; lyf_hadMulti = false; lyf_mouse = null;
    lyf_render(true); lyf_status.textContent = '已还原 · 图片自动居中';
  });
  // 桌面鼠标辅助，不代替上面的四种Touch事件。
  lyf_stage.addEventListener('dblclick',function (lyf_event) {
    if (!lyf_geometry || Date.now()-lyf_lastTouchTime < 750 || (lyf_event.sourceCapabilities && lyf_event.sourceCapabilities.firesTouchEvents)) return;
    lyf_event.preventDefault(); lyf_toggle(lyf_point(lyf_event));
  });
  lyf_stage.addEventListener('pointerdown',function (lyf_event) {
    if (lyf_event.pointerType !== 'mouse' || lyf_event.button !== 0 || !lyf_geometry) return;
    lyf_captureVisible();
    lyf_mouse = {id:lyf_event.pointerId,point:lyf_point(lyf_event),state:Object.assign({},lyf_state)};
    lyf_stage.setPointerCapture(lyf_event.pointerId); lyf_image.style.transition = 'none';
  });
  lyf_stage.addEventListener('pointermove',function (lyf_event) {
    if (!lyf_mouse || lyf_event.pointerId !== lyf_mouse.id) return;
    var lyf_at = lyf_point(lyf_event);
    lyf_state = lyf_math.lyf_limit({scale:lyf_mouse.state.scale,x:lyf_mouse.state.x+lyf_at.x-lyf_mouse.point.x,y:lyf_mouse.state.y+lyf_at.y-lyf_mouse.point.y},lyf_geometry); lyf_render(false);
  });
  function lyf_endMouse() { lyf_mouse = null; }
  lyf_stage.addEventListener('pointerup',lyf_endMouse); lyf_stage.addEventListener('pointercancel',lyf_endMouse); lyf_stage.addEventListener('lostpointercapture',lyf_endMouse);
  function lyf_scheduleMeasure() { clearTimeout(lyf_resizeTimer); lyf_resizeTimer = setTimeout(lyf_measure,80); }
  window.addEventListener('resize',lyf_scheduleMeasure);
  if (typeof ResizeObserver === 'function') new ResizeObserver(lyf_scheduleMeasure).observe(lyf_stage);
  lyf_image.addEventListener('load',lyf_measure);
  lyf_image.addEventListener('error',function () { lyf_status.textContent = '图片未能加载，请确认assets/city-map.svg文件完整。'; });
  if (lyf_image.complete) lyf_measure();
})();
