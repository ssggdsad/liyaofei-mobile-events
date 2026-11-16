# 老师可能检查的关键代码（学习讲解，不是用户真实提问）

姓名：李垚飞　学号：24001010723

## 先打开哪两个文件
VS Code按Ctrl+P，分别输入 mobile-gesture.js、mobile-zoom.js。Ctrl+F搜下列关键词定位；最终准确行号见完成时的代码位置表。HTML负责结构，CSS负责外观，JS负责手势交互。

### 1. 滑动怎么判断？
搜 changedTouches、40。touchstart记下手指起点；touchend拿到抬起坐标，终点减起点得到位移。横向绝对值达到40px，且大于纵向，才是有效横滑。横向为负是左滑下一张，正是右滑上一张。只挪5px很容易把点按抖动当成滑动，所以设置阈值。

### 2. 为什么touchend用changedTouches？
抬起的手指已不在touches列表里；changedTouches保存这次发生变化的手指，才能读取抬起坐标。touches是屏幕上仍接触的所有手指；targetTouches是起始目标为当前元素且仍接触的手指。

### 3. 如何防止一次连跳两张？
搜300。切换后进入300ms冷却，与CSS的0.3秒过渡对应。冷却内的新切换请求忽略；到达第一/最后一张提示而不是越界。

### 4. 双指缩放怎么算？
打开mobile-zoom.js搜lyf_target。用Math.hypot计算两指距离，新倍率=开始时倍率×当前距离/开始距离。zoom-math.js的lyf_zoomAt把倍率限制在1～4倍。

### 5. 怎样保证缩放不跳？
打开zoom-math.js搜lyf_zoomAt。先求两指中点指向的图像点，再按新倍率反算位移，让同一个图像点继续跟着两指中点。使用手势开始时的状态作基准，不逐帧累乘。边界处会限制位移，以不露出多余空白为优先。

### 6. 双指变一指为什么不跳？
mobile-zoom.js搜lyf_beginPan。松开一指后，用当前图片位移和剩余手指当前位置重新记录拖动起点，避免继续用旧坐标。捏合不算轻点，不会误触双击。

### 7. 为什么要touchcancel？
系统中断手势时不一定触发正常touchend，例如切换应用。touchcancel清空手势和双击计时，图片重新约束边界，防止下一次操作卡住。

### 8. touch-action有什么用？
美食卡片用pan-y：纵滑仍能浏览页面，横滑由代码接管；图片操作区用none：双指和拖动由代码处理，避免浏览器把它理解成整页缩放或滚动。只给操作区设置，不把整页禁掉。需preventDefault的监听写passive:false。

### 9. 换横屏为什么倍率还在？
搜lyf_measure、lyf_resizeState。resize后重算容器和原图适应尺寸，保留当前scale，按新图片尺寸换算位移，并重新限制边界，不重置成1倍。

## 如实说明
这是在AI帮助下使用原生HTML/CSS/JavaScript完成的课堂练习，没有用Swiper替代本次手势实现。上述内容是学习资料，不是已完成现场答辩的证明。

## 准确代码行号
见同目录 code-positions.md（按交付时实际源文件生成，不凭印象填行号）。
