/* 李垚飞 · 24001010723 · 任务二：美食触摸卡片。
 * 无依赖；浏览器自绑定 DOM，CommonJS 导出同一套纯手势状态机用于测试。
 */
(function (lyf_root, lyf_factory) {
  'use strict';
  const lyf_api = lyf_factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = lyf_api;
  } else {
    lyf_root.lyf_gesture = lyf_api;
    if (lyf_root.document.readyState === 'loading') {
      lyf_root.document.addEventListener('DOMContentLoaded', function lyf_ready() {
        lyf_api.lyf_bindGesture(lyf_root.document);
      }, { once: true });
    } else {
      lyf_api.lyf_bindGesture(lyf_root.document);
    }
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function lyf_factory() {
  'use strict';

  const lyf_threshold = 40;
  const lyf_cooldown = 300;

  // 只接受至少 40px、横向严格大于纵向的滑动；左下一、右上一。
  function lyf_swipeDecision(lyf_startX, lyf_startY, lyf_endX, lyf_endY) {
    if (![lyf_startX, lyf_startY, lyf_endX, lyf_endY].every(Number.isFinite)) return 0;
    const lyf_dx = lyf_endX - lyf_startX;
    const lyf_dy = lyf_endY - lyf_startY;
    if (Math.abs(lyf_dx) < lyf_threshold || Math.abs(lyf_dx) <= Math.abs(lyf_dy)) return 0;
    return lyf_dx < 0 ? 1 : -1;
  }

  function lyf_createGestureState() {
    return {
      lyf_index: 0,
      lyf_total: 4,
      lyf_lastAction: -Infinity,
      lyf_gesture: null,
      lyf_blocked: false,
      lyf_message: '准备好了，向左滑动，尝尝下一道。'
    };
  }

  function lyf_navigate(lyf_state, lyf_direction, lyf_now) {
    const lyf_cleared = { ...lyf_state, lyf_gesture: null };
    if (lyf_direction !== 1 && lyf_direction !== -1) return lyf_cleared;
    if (!Number.isFinite(lyf_now)) return lyf_cleared;
    if (lyf_now - lyf_state.lyf_lastAction < lyf_cooldown) {
      return { ...lyf_cleared, lyf_message: '切换中，请稍候再试。' };
    }
    const lyf_index = Math.min(lyf_state.lyf_total - 1, Math.max(0, lyf_state.lyf_index + lyf_direction));
    const lyf_message = lyf_index === lyf_state.lyf_index
      ? (lyf_direction < 0 ? '已经是第一张，向左滑动看看下一道。' : '已经是最后一张，向右滑动回味上一道。')
      : '已切换到第 ' + (lyf_index + 1) + '/' + lyf_state.lyf_total + ' 张。';
    return { ...lyf_cleared, lyf_index, lyf_lastAction: lyf_now, lyf_message };
  }

  function lyf_startGesture(lyf_state, lyf_touches, lyf_now) {
    if (!lyf_touches || lyf_touches.length === 0) return lyf_state;
    if (lyf_touches.length !== 1) {
      return { ...lyf_state, lyf_gesture: null, lyf_blocked: true, lyf_message: '检测到多指，请全部松开后用单指滑动。' };
    }
    if (lyf_state.lyf_blocked) return lyf_state;
    const lyf_touch = lyf_touches[0];
    if (lyf_state.lyf_gesture) {
      return lyf_state.lyf_gesture.lyf_identifier === lyf_touch.identifier
        ? lyf_state
        : { ...lyf_state, lyf_gesture: null, lyf_blocked: true };
    }
    if (lyf_now - lyf_state.lyf_lastAction < lyf_cooldown) {
      // 冷却期内开始的整次手势均无效，按住到冷却结束也不会补切一张。
      return { ...lyf_state, lyf_gesture: null, lyf_blocked: true, lyf_message: '切换中，请稍候再试。' };
    }
    if (!Number.isFinite(lyf_touch.clientX) || !Number.isFinite(lyf_touch.clientY)) return lyf_state;
    return {
      ...lyf_state,
      lyf_gesture: { lyf_x: lyf_touch.clientX, lyf_y: lyf_touch.clientY, lyf_identifier: lyf_touch.identifier }
    };
  }

  function lyf_moveGesture(lyf_state, lyf_touches) {
    if (lyf_touches && lyf_touches.length > 1) {
      return {
        lyf_state: { ...lyf_state, lyf_gesture: null, lyf_blocked: true, lyf_message: '检测到多指，请全部松开后用单指滑动。' },
        lyf_preventDefault: false
      };
    }
    if (!lyf_touches || lyf_touches.length !== 1 || !lyf_state.lyf_gesture || lyf_state.lyf_blocked) {
      return { lyf_state, lyf_preventDefault: false };
    }
    const lyf_touch = lyf_touches[0];
    const lyf_gesture = lyf_state.lyf_gesture;
    if (lyf_touch.identifier !== lyf_gesture.lyf_identifier) {
      return { lyf_state: { ...lyf_state, lyf_gesture: null, lyf_blocked: true }, lyf_preventDefault: false };
    }
    const lyf_dx = Math.abs(lyf_touch.clientX - lyf_gesture.lyf_x);
    const lyf_dy = Math.abs(lyf_touch.clientY - lyf_gesture.lyf_y);
    // 8px 排除抖动，横向要明显占优才请求阻止默认行为；纵向不拦截。
    return { lyf_state, lyf_preventDefault: lyf_dx >= 8 && lyf_dx > lyf_dy * 1.25 };
  }

  function lyf_endGesture(lyf_state, lyf_changedTouches, lyf_touches, lyf_now) {
    const lyf_remaining = lyf_touches ? lyf_touches.length : 0;
    const lyf_cleared = { ...lyf_state, lyf_gesture: null, lyf_blocked: lyf_remaining > 0 };
    if (lyf_state.lyf_blocked || lyf_remaining > 0 || !lyf_state.lyf_gesture) return lyf_cleared;
    if (!lyf_changedTouches || lyf_changedTouches.length !== 1) return lyf_cleared;
    // touchend 的 touches 通常为空，结束坐标必须取 changedTouches[0]。
    const lyf_touch = lyf_changedTouches[0];
    const lyf_gesture = lyf_state.lyf_gesture;
    if (lyf_touch.identifier !== lyf_gesture.lyf_identifier) return lyf_cleared;
    const lyf_direction = lyf_swipeDecision(lyf_gesture.lyf_x, lyf_gesture.lyf_y, lyf_touch.clientX, lyf_touch.clientY);
    if (!lyf_direction) {
      return { ...lyf_cleared, lyf_message: '本次未切换；请单指横滑至少 40px，或使用下方按钮。' };
    }
    return lyf_navigate(lyf_cleared, lyf_direction, lyf_now);
  }

  function lyf_cancelGesture(lyf_state) {
    return { ...lyf_state, lyf_gesture: null, lyf_blocked: false, lyf_message: '手势已取消，松开后可以重新滑动。' };
  }

  function lyf_bindGesture(lyf_document) {
    const lyf_stage = lyf_document.getElementById('lyf_touch_stage');
    if (!lyf_stage || lyf_stage.dataset.lyfBound === 'true') return;
    const lyf_track = lyf_document.getElementById('lyf_food_track');
    const lyf_counter = lyf_document.getElementById('lyf_card_counter');
    const lyf_status = lyf_document.getElementById('lyf_gesture_status');
    const lyf_previous = lyf_document.getElementById('lyf_previous');
    const lyf_next = lyf_document.getElementById('lyf_next');
    if (!lyf_track || !lyf_counter || !lyf_status || !lyf_previous || !lyf_next) return;
    lyf_stage.dataset.lyfBound = 'true';
    const lyf_cards = Array.from(lyf_track.children);
    const lyf_dots = Array.from(lyf_document.querySelectorAll('.lyf_progress_dot'));
    let lyf_state = lyf_createGestureState();

    function lyf_now() {
      return lyf_document.defaultView.performance.now();
    }

    function lyf_render() {
      lyf_track.style.transform = 'translateX(-' + lyf_state.lyf_index * 100 + '%)';
      lyf_stage.dataset.lyfIndex = String(lyf_state.lyf_index);
      lyf_counter.textContent = '第 ' + (lyf_state.lyf_index + 1) + '/' + lyf_state.lyf_total + ' 张';
      lyf_status.textContent = lyf_state.lyf_message;
      lyf_cards.forEach(function lyf_markCard(lyf_card, lyf_index) {
        lyf_card.setAttribute('aria-hidden', String(lyf_index !== lyf_state.lyf_index));
      });
      lyf_dots.forEach(function lyf_markDot(lyf_dot, lyf_index) {
        lyf_dot.classList.toggle('lyf_is_current', lyf_index === lyf_state.lyf_index);
      });
      // 边界按钮仍可点，读屏和桌面用户也能获得首尾提示。
      lyf_previous.dataset.lyfBoundary = String(lyf_state.lyf_index === 0);
      lyf_next.dataset.lyfBoundary = String(lyf_state.lyf_index === lyf_state.lyf_total - 1);
    }

    function lyf_requestNavigation(lyf_direction) {
      lyf_state = lyf_navigate(lyf_state, lyf_direction, lyf_now());
      lyf_render();
    }

    lyf_stage.addEventListener('touchstart', function lyf_touchStart(lyf_event) {
      lyf_state = lyf_startGesture(lyf_state, lyf_event.touches, lyf_now());
      lyf_render();
    }, { passive: true });

    lyf_stage.addEventListener('touchmove', function lyf_touchMove(lyf_event) {
      const lyf_result = lyf_moveGesture(lyf_state, lyf_event.touches);
      lyf_state = lyf_result.lyf_state;
      if (lyf_result.lyf_preventDefault && lyf_event.cancelable) lyf_event.preventDefault();
    }, { passive: false });

    lyf_stage.addEventListener('touchend', function lyf_touchEnd(lyf_event) {
      lyf_state = lyf_endGesture(lyf_state, lyf_event.changedTouches, lyf_event.touches, lyf_now());
      lyf_render();
    }, { passive: true });

    lyf_stage.addEventListener('touchcancel', function lyf_touchCancel() {
      lyf_state = lyf_cancelGesture(lyf_state);
      lyf_render();
    }, { passive: true });

    lyf_previous.addEventListener('click', function lyf_previousClick() { lyf_requestNavigation(-1); });
    lyf_next.addEventListener('click', function lyf_nextClick() { lyf_requestNavigation(1); });
    lyf_stage.addEventListener('keydown', function lyf_keyboard(lyf_event) {
      if (lyf_event.key !== 'ArrowLeft' && lyf_event.key !== 'ArrowRight') return;
      lyf_event.preventDefault();
      lyf_requestNavigation(lyf_event.key === 'ArrowRight' ? 1 : -1);
    });
    lyf_render();
  }

  return Object.freeze({
    lyf_swipeDecision, lyf_createGestureState, lyf_startGesture, lyf_moveGesture,
    lyf_endGesture, lyf_cancelGesture, lyf_navigate, lyf_bindGesture
  });
}));
