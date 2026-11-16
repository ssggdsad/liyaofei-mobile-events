# 移动端事件作业 Implementation Plan

**Goal:** 交付原生触摸卡片和双指缩放图片查看器，可离线打开、检查JS、查看真实记录。
**Architecture:** 两个独立HTML/CSS/JS页面，共用styles.css；图片查看器将纯几何计算放入zoom-math.js并用node:test隔离测试；入口聚合任务和材料，真实日志用iframe+原文件链接直接展示，避免file:// fetch限制。
**Spec:** docs/engineering/spec.md

## Global Constraints
仅任务二三，40px/300ms/0.3s，缩放1～4倍/双击1或2倍/0.25s，lyf_命名前缀，零在线依赖，不改旧作业、不提交推送。

### Task 1: 美食卡片
Files: mobile-gesture.html/css/js、tests/gesture.test.cjs。独占文件给实现者。
- [ ] 先写node:test验证40px横向判定、300ms冷却、边界和取消并运行确认失败。
- [ ] 实现四道菜与触摸/按钮共用切换函数、pan-y、过渡、多指防误触。
- [ ] 单元测试通过后交回主会话集成并复核浏览器。

### Task 2: 图片查看器
Files: mobile-zoom.html/css/js、zoom-math.js、assets/city-map.svg、tests/zoom.test.cjs。
- [ ] 先写倍率夹取、图像边界、锚点缩放、resize保留状态测试，运行确认失败。
- [ ] 实现纯函数及touchstart/move/end/cancel状态机，双击、单指、多指切换、resize。
- [ ] 运行node --test tests/*.test.cjs确认行为。

### Task 3: 展示与验收
Files: index.html/styles.css/prompts.html/README.md/docs/evidence/tests/browser.cjs。
- [ ] 制作作业入口、真实提示词入口、源码入口、答辩说明，父目录仅新增一个卡片入口。
- [ ] Edge真实浏览器CDP发送单指/双指/取消事件，390/1440px及横屏自适应，无控制台错误及横向溢出。
- [ ] 保存运行截图、JSON测试结果、实际问题和修复；追加完成记录；不提交、不发布。
