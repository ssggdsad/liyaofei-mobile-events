# 移动端事件课堂作业

姓名：李垚飞　学号：24001010723

## 怎么打开
直接双击本目录 index.html，不需要 npm install、联网或启动后端。也可以在VS Code安装好的Live Server中打开。手机测试需要通过同一局域网静态服务器地址或以后部署的HTTPS地址访问，不能把电脑file://地址当成手机地址。

## 文件
- index.html：任务首页；mobile-gesture.html：任务二；mobile-zoom.html：任务三。
- styles.css：共用样式；mobile-gesture.css、mobile-zoom.css：各任务样式。
- mobile-gesture.js：40px阈值、方向、300ms冷却、边界与触摸事件。
- mobile-zoom.js：触摸状态机、双指/单指转换、双击、取消、横竖屏。
- zoom-math.js：缩放锚点与边界计算，供页面和单元测试共用。
- assets/city-map.svg：本地原创虚构街区大图，无外网依赖。
- wy_prompt.md：本项目真实记录；prompt.md为内容一致的提交兼容副本；prompts.html直接展示wy_prompt.md。
- evidence/index.html：真实浏览器运行截图与测试结果；docs/defense.md：基础答辩；docs/troubleshooting.md：实际排错。

## 测试
Node 18+：在本目录运行 node --test tests/*.test.cjs。浏览器测试脚本 tests/browser.cjs 使用 Playwright Core；需自行安装或通过 LYF_PLAYWRIGHT_PATH 指向本机已安装模块，LYF_BROWSER_PATH可指定Chromium/Edge路径。浏览器测试自带临时本地静态服务器，退出时关闭。

## 范围与真实性
只完成老师第②关和第③关；任务一观察和任务四传感器未选。本次为AI辅助课堂实现，不声称学生本人已完成现场答辩或真机验收。本地测试通过不等于老师一定给分，不包含自动Git提交或推送。

## 2026-11-16老师截图补充
任务三要求另用设备拍摄手机实体操作并插入页面。2026-11-16已收到用户视频并嵌入mobile-zoom.html，资源在evidence/mobile-zoom-phone.mp4；用户随后提供约6秒新版video.mp4并确认动作均已拍到，项目内旧版已替换；详见docs/phone-demo.md。用户已授权公开发布，实际发布状态见部署记录。
