# 公网发布记录

姓名：李垚飞　学号：24001010723

## 已发布并验证（2026-11-16 16:03，Asia/Shanghai）

老师应收网页地址：https://ssggdsad.github.io/liyaofei-mobile-events/
任务三和新视频：https://ssggdsad.github.io/liyaofei-mobile-events/mobile-zoom.html
真实提示词记录：https://ssggdsad.github.io/liyaofei-mobile-events/prompts.html
代码仓库：https://github.com/ssggdsad/liyaofei-mobile-events

GitHub Pages来源：main分支根目录/；.nojekyll；GitHub平台托管，不依赖用户电脑开机或局域网预览服务。首次验证发布提交：b48648e7556784437250ec63f38dfceb5ab8b790，构建状态built。本文及问答记录随后同步提交时，最终提交号以远端main和Pages构建为准，不把自引用提交号伪造为当前文件所属提交。

## 真实线上验证
- 首页、任务二、任务三、prompts.html、wy_prompt.md与新版MP4均HTTP 200。
- 390像素手机模式首页两项任务，无横向溢出。
- 任务二点击下一道显示第2/4张。
- 任务三CDP真实双指操作后2.00倍。
- 公网新视频时长6.435秒、1080×1920，调用play后currentTime真实推进，媒体错误为null。
- 记录页iframe实际载入wy_prompt.md并包含本次“这个我确认都拍到了”真实提问。
- 页面JS无错误。证据在evidence/live-results.json及两张live截图。
- 本地全量单元42/42、Edge/CDP35/35通过。用户本人明确确认新视频动作均已拍到；此结论不是老师评分保证。

## 上传方式与历史
普通Git HTTPS两次分别连接重置和443连接超时，不能说这两次push成功。改用现有安全凭据访问GitHub官方API，文件树与原本地提交哈希逐一核对；保留初始化提交及原本地提交，以非强制快进更新远端main，并同步本地主分支。没有force、reset、删除旧提交；没有修改全局认证或身份。

新仓库只含mobile-events-project；其它课堂项目与本地.planning未上传。项目内旧43秒视频及封面已被新版替换，用户电脑原始录像未删除。
