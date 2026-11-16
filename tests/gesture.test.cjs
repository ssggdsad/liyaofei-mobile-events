'use strict';

const { test: lyf_test } = require('node:test');
const lyf_assert = require('node:assert/strict');
const {
  lyf_swipeDecision,
  lyf_createGestureState,
  lyf_startGesture,
  lyf_moveGesture,
  lyf_endGesture,
  lyf_cancelGesture,
  lyf_navigate
} = require('../mobile-gesture.js');

function lyf_touch(lyf_x, lyf_y, lyf_identifier = 7) {
  return { clientX: lyf_x, clientY: lyf_y, identifier: lyf_identifier };
}

function lyf_swipe(lyf_state, lyf_startX, lyf_startY, lyf_endX, lyf_endY, lyf_now = 0) {
  const lyf_started = lyf_startGesture(lyf_state, [lyf_touch(lyf_startX, lyf_startY)], lyf_now);
  return lyf_endGesture(lyf_started, [lyf_touch(lyf_endX, lyf_endY)], [], lyf_now + 10);
}

lyf_test('39px is below the swipe threshold', () => {
  lyf_assert.equal(lyf_swipeDecision(100, 100, 61, 100), 0);
});

lyf_test('exactly 40px left is next and 40px right is previous', () => {
  lyf_assert.equal(lyf_swipeDecision(100, 100, 60, 100), 1);
  lyf_assert.equal(lyf_swipeDecision(100, 100, 140, 100), -1);
});

lyf_test('vertical and equal diagonal gestures never change cards', () => {
  lyf_assert.equal(lyf_swipeDecision(100, 100, 30, 190), 0);
  lyf_assert.equal(lyf_swipeDecision(100, 100, 30, 170), 0);
  lyf_assert.equal(lyf_swipeDecision(100, 100, 100, 260), 0);
});

lyf_test('horizontal distance must strictly exceed vertical distance', () => {
  lyf_assert.equal(lyf_swipeDecision(100, 100, 20, 179), 1);
});

lyf_test('invalid coordinates do not trigger navigation', () => {
  lyf_assert.equal(lyf_swipeDecision(NaN, 0, 100, 0), 0);
  lyf_assert.equal(lyf_swipeDecision(0, 0, Infinity, 0), 0);
});

lyf_test('state starts on the first of four cards', () => {
  const lyf_state = lyf_createGestureState();
  lyf_assert.equal(lyf_state.lyf_index, 0);
  lyf_assert.equal(lyf_state.lyf_total, 4);
  lyf_assert.equal(lyf_state.lyf_gesture, null);
});

lyf_test('touchstart saves client coordinates and touch identifier', () => {
  const lyf_state = lyf_startGesture(lyf_createGestureState(), [lyf_touch(220, 185, 12)], 0);
  lyf_assert.equal(lyf_state.lyf_gesture.lyf_x, 220);
  lyf_assert.equal(lyf_state.lyf_gesture.lyf_y, 185);
  lyf_assert.equal(lyf_state.lyf_gesture.lyf_identifier, 12);
});

lyf_test('touchend uses changedTouches even when touches is empty', () => {
  const lyf_state = lyf_swipe(lyf_createGestureState(), 200, 100, 160, 105);
  lyf_assert.equal(lyf_state.lyf_index, 1);
  lyf_assert.equal(lyf_state.lyf_gesture, null);
  lyf_assert.match(lyf_state.lyf_message, /2\/4/);
});

lyf_test('sub-threshold and vertical touch sequences preserve the index', () => {
  lyf_assert.equal(lyf_swipe(lyf_createGestureState(), 200, 100, 161, 100).lyf_index, 0);
  lyf_assert.equal(lyf_swipe(lyf_createGestureState(), 200, 100, 120, 200).lyf_index, 0);
});

lyf_test('right swipe returns to the previous card', () => {
  const lyf_state = lyf_navigate(lyf_createGestureState(), 1, 0);
  lyf_assert.equal(lyf_swipe(lyf_state, 100, 100, 145, 102, 300).lyf_index, 0);
});

lyf_test('touch and button attempts share the 300ms cooldown', () => {
  const lyf_first = lyf_swipe(lyf_createGestureState(), 200, 100, 100, 100, 0);
  const lyf_blocked = lyf_navigate(lyf_first, 1, 309);
  lyf_assert.equal(lyf_blocked.lyf_index, 1);
  lyf_assert.match(lyf_blocked.lyf_message, /稍候/);
  lyf_assert.equal(lyf_navigate(lyf_blocked, 1, 310).lyf_index, 2);
});

lyf_test('a touch begun during button cooldown remains ineligible after cooldown expires', () => {
  const lyf_first = lyf_navigate(lyf_createGestureState(), 1, 0);
  const lyf_started = lyf_startGesture(lyf_first, [lyf_touch(200, 100)], 299);
  const lyf_ended = lyf_endGesture(lyf_started, [lyf_touch(100, 100)], [], 600);
  lyf_assert.equal(lyf_ended.lyf_index, 1);
  lyf_assert.equal(lyf_navigate(lyf_ended, 1, 601).lyf_index, 2);
});

lyf_test('rapid repeated swipes cannot skip two cards', () => {
  const lyf_first = lyf_swipe(lyf_createGestureState(), 200, 100, 100, 100, 0);
  const lyf_second = lyf_swipe(lyf_first, 200, 100, 100, 100, 20);
  const lyf_third = lyf_swipe(lyf_second, 200, 100, 100, 100, 40);
  lyf_assert.equal(lyf_third.lyf_index, 1);
});

lyf_test('repeated touchend without a new touchstart cannot navigate', () => {
  const lyf_first = lyf_swipe(lyf_createGestureState(), 200, 100, 100, 100);
  lyf_assert.equal(lyf_endGesture(lyf_first, [lyf_touch(0, 100)], [], 500).lyf_index, 1);
});

lyf_test('a held touch keeps its original start instead of being rearmed', () => {
  let lyf_state = lyf_startGesture(lyf_createGestureState(), [lyf_touch(200, 100)], 0);
  lyf_state = lyf_startGesture(lyf_state, [lyf_touch(180, 100)], 30);
  lyf_state = lyf_endGesture(lyf_state, [lyf_touch(160, 100)], [], 100);
  lyf_assert.equal(lyf_state.lyf_index, 1);
});

lyf_test('button navigation while a finger is held invalidates that old gesture', () => {
  const lyf_started = lyf_startGesture(lyf_createGestureState(), [lyf_touch(200, 100)], 0);
  const lyf_button = lyf_navigate(lyf_started, 1, 10);
  const lyf_ended = lyf_endGesture(lyf_button, [lyf_touch(100, 100)], [], 500);
  lyf_assert.equal(lyf_ended.lyf_index, 1);
});

lyf_test('first and last card attempts clamp the index and announce a boundary', () => {
  let lyf_state = lyf_navigate(lyf_createGestureState(), -1, 0);
  lyf_assert.equal(lyf_state.lyf_index, 0);
  lyf_assert.match(lyf_state.lyf_message, /第一/);
  lyf_state = lyf_navigate(lyf_state, 1, 300);
  lyf_state = lyf_navigate(lyf_state, 1, 600);
  lyf_state = lyf_navigate(lyf_state, 1, 900);
  lyf_assert.equal(lyf_state.lyf_index, 3);
  lyf_state = lyf_navigate(lyf_state, 1, 1200);
  lyf_assert.equal(lyf_state.lyf_index, 3);
  lyf_assert.match(lyf_state.lyf_message, /最后/);
});

lyf_test('touch swipes also announce both boundaries without wrapping', () => {
  let lyf_state = lyf_swipe(lyf_createGestureState(), 100, 100, 160, 100, 0);
  lyf_assert.equal(lyf_state.lyf_index, 0);
  lyf_assert.match(lyf_state.lyf_message, /第一/);
  lyf_state = lyf_navigate(lyf_state, 1, 400);
  lyf_state = lyf_navigate(lyf_state, 1, 700);
  lyf_state = lyf_navigate(lyf_state, 1, 1000);
  lyf_state = lyf_swipe(lyf_state, 200, 100, 100, 100, 1300);
  lyf_assert.equal(lyf_state.lyf_index, 3);
  lyf_assert.match(lyf_state.lyf_message, /最后/);
});

lyf_test('multi-touch at start is ignored until all fingers are lifted', () => {
  let lyf_state = lyf_startGesture(lyf_createGestureState(), [lyf_touch(200, 100), lyf_touch(220, 100, 8)], 0);
  lyf_state = lyf_endGesture(lyf_state, [lyf_touch(220, 100, 8)], [lyf_touch(200, 100)], 10);
  lyf_state = lyf_startGesture(lyf_state, [lyf_touch(200, 100)], 20);
  lyf_state = lyf_endGesture(lyf_state, [lyf_touch(50, 100)], [], 30);
  lyf_assert.equal(lyf_state.lyf_index, 0);
  lyf_assert.equal(lyf_swipe(lyf_state, 200, 100, 100, 100, 40).lyf_index, 1);
});

lyf_test('a second finger added after start invalidates the entire gesture', () => {
  let lyf_state = lyf_startGesture(lyf_createGestureState(), [lyf_touch(200, 100)], 0);
  lyf_state = lyf_startGesture(lyf_state, [lyf_touch(200, 100), lyf_touch(180, 100, 8)], 5);
  lyf_state = lyf_endGesture(lyf_state, [lyf_touch(180, 100, 8)], [lyf_touch(200, 100)], 10);
  lyf_state = lyf_endGesture(lyf_state, [lyf_touch(100, 100)], [], 50);
  lyf_assert.equal(lyf_state.lyf_index, 0);
});

lyf_test('multi-touch found during touchmove never prevents scrolling or navigates', () => {
  const lyf_started = lyf_startGesture(lyf_createGestureState(), [lyf_touch(200, 100)], 0);
  const lyf_moved = lyf_moveGesture(lyf_started, [lyf_touch(100, 100), lyf_touch(180, 100, 8)]);
  lyf_assert.equal(lyf_moved.lyf_preventDefault, false);
  lyf_assert.equal(lyf_endGesture(lyf_moved.lyf_state, [lyf_touch(100, 100)], [], 100).lyf_index, 0);
});

lyf_test('horizontal intent requests preventDefault but vertical, diagonal and jitter do not', () => {
  const lyf_state = lyf_startGesture(lyf_createGestureState(), [lyf_touch(200, 100)], 0);
  lyf_assert.equal(lyf_moveGesture(lyf_state, [lyf_touch(170, 105)]).lyf_preventDefault, true);
  lyf_assert.equal(lyf_moveGesture(lyf_state, [lyf_touch(170, 160)]).lyf_preventDefault, false);
  lyf_assert.equal(lyf_moveGesture(lyf_state, [lyf_touch(170, 130)]).lyf_preventDefault, false);
  lyf_assert.equal(lyf_moveGesture(lyf_state, [lyf_touch(195, 100)]).lyf_preventDefault, false);
});

lyf_test('wrong touch identifier and missing changedTouches never cause navigation', () => {
  const lyf_state = lyf_startGesture(lyf_createGestureState(), [lyf_touch(200, 100)], 0);
  lyf_assert.equal(lyf_endGesture(lyf_state, [lyf_touch(100, 100, 99)], [], 50).lyf_index, 0);
  lyf_assert.equal(lyf_endGesture(lyf_state, [], [], 50).lyf_index, 0);
});

lyf_test('touchcancel clears a pending gesture and allows the next fresh gesture', () => {
  const lyf_started = lyf_startGesture(lyf_createGestureState(), [lyf_touch(200, 100)], 0);
  const lyf_cancelled = lyf_cancelGesture(lyf_started);
  lyf_assert.equal(lyf_cancelled.lyf_gesture, null);
  lyf_assert.equal(lyf_cancelled.lyf_blocked, false);
  lyf_assert.match(lyf_cancelled.lyf_message, /取消/);
  lyf_assert.equal(lyf_endGesture(lyf_cancelled, [lyf_touch(100, 100)], [], 100).lyf_index, 0);
  lyf_assert.equal(lyf_swipe(lyf_cancelled, 200, 100, 100, 100, 200).lyf_index, 1);
});

lyf_test('cancel does not bypass the common cooldown', () => {
  const lyf_state = lyf_cancelGesture(lyf_navigate(lyf_createGestureState(), 1, 0));
  lyf_assert.equal(lyf_navigate(lyf_state, 1, 299).lyf_index, 1);
  lyf_assert.equal(lyf_navigate(lyf_state, 1, 300).lyf_index, 2);
});

lyf_test('pure operations never mutate their input state or touch coordinates', () => {
  const lyf_state = Object.freeze(lyf_createGestureState());
  const lyf_point = Object.freeze(lyf_touch(200, 100));
  const lyf_started = lyf_startGesture(lyf_state, [lyf_point], 0);
  Object.freeze(lyf_started.lyf_gesture);
  Object.freeze(lyf_started);
  lyf_moveGesture(lyf_started, [lyf_touch(150, 100)]);
  lyf_endGesture(lyf_started, [lyf_touch(150, 100)], [], 100);
  lyf_navigate(lyf_started, 1, 100);
  lyf_cancelGesture(lyf_started);
  lyf_assert.equal(lyf_state.lyf_index, 0);
  lyf_assert.equal(lyf_started.lyf_gesture.lyf_x, 200);
});
