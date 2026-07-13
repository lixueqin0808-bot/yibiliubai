# 一笔留白 V2：黄金样板关实施计划

日期：2026-07-13  
依据：`docs/superpowers/specs/2026-07-13-yibiliubai-v2-golden-level-design.md`  
目标：在不影响现有线上版本的前提下，完成一个可在手机竖屏和电脑浏览器中试玩的黄金样板关，并通过五项质量门槛。

## 1. 实施原则

- V2 在独立目录开发，旧版继续可用。
- 先证明规则正确，再加入手感反馈和正式美术。
- 每个阶段都必须通过自动检查和实际试玩，不能把问题积累到最后。
- 核心碰撞、面积和状态逻辑不得依赖视觉效果才能正确工作。
- 用户只参与视觉选择、AI 素材生成和手感验收。
- 黄金样板关通过前，不扩展第二关，不制作开场视频，不迁移 GitHub Pages。

## 2. 目标目录

```text
v2/
  index.html
  package.json
  .gitignore
  tsconfig.json
  vite.config.ts
  playwright.config.ts
  public/
    assets/
      images/
      textures/
      audio/
  src/
    main.ts
    styles.css
    core/
      Game.ts
      GameState.ts
      Clock.ts
      types.ts
    geometry/
      polygon.ts
      cut.ts
      collision.ts
    physics/
      PhysicsWorld.ts
      InkBladeBody.ts
      BoundaryBodies.ts
    render/
      CanvasRenderer.ts
      Camera.ts
      InkEffects.ts
      AssetStore.ts
    input/
      PointerController.ts
    levels/
      goldenLevel.ts
      types.ts
    audio/
      AudioManager.ts
    ui/
      UiController.ts
      TutorialController.ts
      ResultController.ts
    storage/
      ProgressStore.ts
    tests/
      fixtures.ts
      polygon.test.ts
      cut.test.ts
      collision.test.ts
      game-state.test.ts
  e2e/
    golden-level.spec.ts
```

## 3. 阶段一：隔离开发环境

### 任务 1：建立 V2 骨架

新增文件：

- `v2/package.json`
- `v2/.gitignore`
- `v2/tsconfig.json`
- `v2/vite.config.ts`
- `v2/index.html`
- `v2/src/main.ts`
- `v2/src/styles.css`

安装运行依赖：

- `matter-js`

安装开发依赖：

- `typescript`
- `vite`
- `vitest`
- `@types/matter-js`
- `@playwright/test`

脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "preview": "vite preview"
  }
}
```

验收：

- `npm install` 成功。
- `npm run build` 生成 `v2/dist/`。
- 页面显示 390 x 844 的空白竖屏舞台。
- 旧版根目录文件没有被修改。

提交建议：`chore(v2): scaffold portrait game workspace`

### 任务 2：建立坐标和缩放系统

实现文件：

- `v2/src/render/Camera.ts`
- `v2/src/input/PointerController.ts`
- `v2/src/styles.css`

规则：

- 内部逻辑坐标固定为 390 x 844。
- Canvas 使用设备像素比渲染，但所有规则计算使用逻辑坐标。
- 手机端占满可用容器；电脑端最大宽度 430 像素并居中。
- Pointer Events 同时支持触屏和鼠标。
- 禁止操作区域内的滚动、缩放、双击放大和长按菜单。

验收：

- 390 x 844、360 x 800、430 x 932 和电脑 1440 x 900 下坐标一致。
- 点击画面四角，调试标记与指针位置重合。
- 缩放浏览器后无需刷新即可重新布局。

提交建议：`feat(v2): add portrait viewport and pointer mapping`

## 4. 阶段二：先把规则做对

### 任务 3：定义关卡和状态模型

实现文件：

- `v2/src/core/types.ts`
- `v2/src/core/GameState.ts`
- `v2/src/levels/types.ts`
- `v2/src/levels/goldenLevel.ts`
- `v2/src/tests/game-state.test.ts`

状态：

- `loading`
- `tutorial`
- `playing`
- `cutting`
- `resolvingCut`
- `failed`
- `completed`
- `paused`

黄金样板关数据包含：初始多边形、目标比例、墨刃位置和速度、教学速度、三星阈值、可切边界标记。

验收：

- 非法状态跳转被拒绝。
- 暂停后物理和计时同时停止。
- 重开恢复同一份初始关卡数据，不残留上次切割结果。

提交建议：`feat(v2): define golden level state model`

### 任务 4：实现多边形与面积基础

实现文件：

- `v2/src/geometry/polygon.ts`
- `v2/src/geometry/cut.ts`
- `v2/src/tests/fixtures.ts`
- `v2/src/tests/polygon.test.ts`
- `v2/src/tests/cut.test.ts`

测试先行，覆盖：

- 顺时针和逆时针多边形面积一致。
- 水平、垂直和斜向切线产生两个合法区域。
- 切线擦过顶点时不会产生重复点或零面积碎片。
- 切掉极小碎片时结果仍是合法多边形。
- 切割前后两侧面积之和与原面积一致，误差不超过设定容差。
- 切线没有形成两个有效交点时返回明确的无效原因。

验收命令：

```powershell
npm test -- polygon.test.ts cut.test.ts
```

提交建议：`feat(v2): implement tested polygon cutting`

### 任务 5：实现切线与墨刃碰撞

实现文件：

- `v2/src/geometry/collision.ts`
- `v2/src/tests/collision.test.ts`

规则：

- 墨刃碰撞体是圆形，视觉笔锋不能改变碰撞半径。
- 判定使用切线线段到圆心的最短距离。
- 为高速移动增加上一帧到当前帧的扫掠检测，避免穿透。
- 临界接触按失败处理，保证规则稳定。

验收：

- 正穿、擦边、端点接触、高速跨越和明确未接触均有测试。
- 测试结果不依赖帧率。

提交建议：`feat(v2): add deterministic cut collision checks`

### 任务 6：实现动态边界物理

实现文件：

- `v2/src/physics/PhysicsWorld.ts`
- `v2/src/physics/InkBladeBody.ts`
- `v2/src/physics/BoundaryBodies.ts`

规则：

- Matter.js 负责墨刃运动与边界碰撞。
- 当前多边形每条边转换为静态边界体。
- 成功切割后在同一逻辑帧重建边界体。
- 墨刃位置在边界重建后必须仍位于保留区域内。
- 固定时间步更新，避免不同刷新率造成明显速度差异。

验收：

- 墨刃从多种角度撞击边界后合理反射。
- 连续运行五分钟不穿墙、不静止、不异常加速。
- 连续切出狭窄区域后仍不会卡进边界。

提交建议：`feat(v2): add matter physics for ink blade`

### 任务 7：串联完整切割闭环

实现文件：

- `v2/src/core/Game.ts`
- `v2/src/input/PointerController.ts`
- `v2/src/render/CanvasRenderer.ts`

处理顺序：

1. 记录起点和当前点。
2. 实时显示物理切线预览。
3. 松手后冻结输入。
4. 先判定墨刃碰撞。
5. 再判定边界交点和两个切割结果。
6. 判断墨刃位于哪一侧。
7. 更新保留区域、面积进度和物理边界。
8. 恢复输入或进入完成状态。

验收：

- 成功、碰撞失败、没有穿过、两侧都有墨刃四种结果清楚可复现。
- 快速连续输入不会在结算切割期间触发第二次切割。
- 达到 50% 后只触发一次过关。

提交建议：`feat(v2): complete golden level cut loop`

## 5. 检查点 A：无美术规则验收

此时使用简单黑白占位图，不请求用户生成素材。

Codex 自检：

- 全部单元测试通过。
- 在电脑鼠标和移动设备模拟触控下完成关卡。
- 录制成功、失败、无效切割三种行为的短演示。

只有切割与碰撞稳定后，进入手感阶段。规则有问题时直接修复，不用美术掩盖。

## 6. 阶段三：完成手感和基础产品闭环

### 任务 8：实现切割反馈系统

实现文件：

- `v2/src/render/InkEffects.ts`
- `v2/src/render/CanvasRenderer.ts`
- `v2/src/core/Clock.ts`

效果按事件驱动：

- `cutStarted`
- `cutNearDanger`
- `cutSucceeded`
- `cutFailed`
- `cutInvalid`
- `levelCompleted`

实现：动态笔锋、40 毫秒成功停顿、切片错位、350 毫秒墨雾消散、60 毫秒失败停顿、朱红碰撞墨点、250 毫秒重开遮罩和轻微屏幕震动。

验收：

- 关闭粒子后规则仍完全正常。
- 动画期间状态机不接受非法操作。
- 低性能设备可减少粒子数量，不降低碰撞精度。

提交建议：`feat(v2): add responsive ink cut feedback`

### 任务 9：实现音效和震动

实现文件：

- `v2/src/audio/AudioManager.ts`

第一版使用 Web Audio 合成和少量短音频层，不依赖背景音乐：

- 起笔声
- 拖动摩擦声
- 成功切纸声
- 墨雾散开声
- 碰撞断弦声
- 过关印章声

规则：首次用户手势后解锁音频；静音状态持久化；震动不可用时静默降级。

验收：

- iOS 和 Android 浏览器限制下不会自动播放报错。
- 快速重开不会叠加残留声音。
- 静音后无任何新声音节点播放。

提交建议：`feat(v2): add layered audio and haptics`

### 任务 10：实现教程、帮助、暂停和结算

实现文件：

- `v2/src/ui/UiController.ts`
- `v2/src/ui/TutorialController.ts`
- `v2/src/ui/ResultController.ts`
- `v2/src/storage/ProgressStore.ts`
- `v2/index.html`
- `v2/src/styles.css`

教程流程：

1. 动态示范线提示第一笔。
2. 第一次成功后说明保留规则。
3. 墨刃靠近切线时说明碰撞失败。

基础功能：暂停、继续、重试、帮助、声音、过关星级、时间、有效切割次数、最高星级保存。

验收：

- 首次进入显示教程，再次进入不强制重复。
- 帮助页可重新启动教程。
- localStorage 不可用时仍能正常玩。
- 所有按钮在 360 像素宽度下不重叠、不截字。

提交建议：`feat(v2): add tutorial and game shell`

## 7. 检查点 B：手感试玩

向用户提供本地试玩地址和三段对比：

- 成功切割
- 墨刃碰撞
- 无效切割

用户只需评价：

1. 切线是否跟手和准确。
2. 成功瞬间是否有释放感。
3. 失败是否清楚但不拖沓。

本节点最多进行两轮参数微调。若需要改变核心规则，则回到阶段二处理，而不是在视觉层补偿。

## 8. 阶段四：AI 美术协作

### 任务 11：生成两套视觉候选提示词

Codex 产出一个独立美术包说明，包含：

- 统一色板、材质和禁用元素
- 图片尺寸、透明背景和安全区
- A 方案：锋利武侠泼墨
- B 方案：宣纸扩散写意
- 宣纸背景提示词
- 墨刃透明素材提示词
- 朱红印章提示词
- 墨雾纹理提示词
- Image 2 的负面约束和一致性要求

用户使用 Image 2 生成候选图，只需要返回原图，不需要自行裁切或压缩。

验收：用户明确选择 A、B 或指定混合比例。

提交建议：`docs(v2): add AI art production brief`

### 任务 12：处理和集成正式素材

实现文件：

- `v2/src/render/AssetStore.ts`
- `v2/public/assets/images/*`
- `v2/public/assets/textures/*`

Codex 负责：

- 去除不需要的背景
- 统一画布、边缘、对比度和朱红色值
- 输出 WebP 或 PNG
- 生成 1x/2x 规格
- 对齐视觉轮廓与物理碰撞体
- 压缩首屏资源

验收：

- AI 素材与程序效果风格一致。
- 墨刃视觉主体不超出碰撞轮廓造成误判。
- 首屏资源尽量控制在 3 MB 内。
- 素材加载失败时有可玩的程序化后备外观。

提交建议：`feat(v2): integrate final ink art assets`

## 9. 阶段五：自动化与设备验收

### 任务 13：浏览器端流程测试

实现文件：

- `v2/e2e/golden-level.spec.ts`
- `v2/playwright.config.ts`

覆盖：

- 首次进入和教程显示
- 鼠标完成一次成功切割
- 碰撞失败后自动重开
- 暂停后墨刃停止移动
- 静音状态保存
- 过关后显示星级
- 刷新后保留最高星级

视口：

- 390 x 844 手机竖屏
- 360 x 800 小屏手机
- 430 x 932 大屏手机
- 1440 x 900 电脑

验收命令：

```powershell
npm run test
npm run build
npm run test:e2e
```

提交建议：`test(v2): cover golden level browser flow`

### 任务 14：视觉和性能验收

检查：

- Playwright 截图中没有文字、按钮和游戏区域重叠。
- Canvas 像素检查确认不是空白画面。
- 设备像素比变化后画面保持清晰。
- 连续运行十分钟无明显内存持续增长。
- 目标设备接近 60 帧，低性能降级只减少粒子。
- 输入反馈尽量低于 50 毫秒。
- 失败后 0.6 秒内恢复操作。

产出：四种视口截图、一段完整试玩录屏、自动测试结果和已知限制说明。

提交建议：`test(v2): verify portrait performance and visuals`

## 10. 检查点 C：黄金样板关总验收

按固定顺序验收：

1. 切割准确性
2. 碰撞规则
3. 反馈爽感
4. 视觉方向
5. 设备表现

任何一项未通过，都只修复对应层，不扩展关卡。五项全部通过后，黄金样板关状态改为“通过”，才能建立五关实施计划。

## 11. 阶段六：发布与同步

### 任务 15：保留旧版并准备 V2 发布

- 给当前线上版本建立可回退标签。
- 将旧版静态文件保留到 `legacy/` 或单独发布分支。
- V2 构建的 `base` 配置为 `/yibiliubai/`。
- 添加 GitHub Actions 构建和 Pages 发布流程。
- 在发布前向用户明确说明 Pages 来源将从“分支根目录”迁移到 GitHub Actions。

迁移依据：Vite 官方 GitHub Pages 部署方式使用构建后的 `dist` 静态文件和 Actions 工作流。

验收：

- 本地 `npm run build` 通过。
- 构建产物中的资源路径均包含正确仓库前缀。
- 旧版有明确回退方式。

提交建议：`ci(v2): add GitHub Pages deployment`

### 任务 16：发布验证

- 同步 Obsidian 项目副本。
- 提交并推送 GitHub。
- 等待 Pages 构建完成。
- 使用带缓存破坏参数的请求确认线上 HTML、脚本和美术均为 V2。
- 在手机浏览器和电脑浏览器实际打开公网地址。
- 验证 iframe 嵌入页面。

最终交付：

- GitHub Pages 公网地址
- 本地项目路径
- Obsidian 同步路径
- 黄金样板关验收记录
- 下一阶段五关扩展入口

提交建议：`release: publish V2 golden level`

## 12. 停止条件与协作规则

- 几何或碰撞出现不稳定：停止视觉工作，先修规则。
- 现有依赖无法稳定支持动态边界：在同一物理接口内替换实现，不改上层游戏规则。
- AI 素材质量不达标：先继续使用程序化后备素材，不阻塞规则和手感测试。
- 需要用户审美决策：一次提供两个清楚候选，不让用户从空白开始设计。
- 需要用户使用 Image 2 或即梦：Codex 先提供完整提示词、尺寸、时长和负面约束。
- 普通代码、测试、裁切、压缩和部署问题由 Codex 自行处理。
- 未经用户验收黄金样板关，不开始第二至第五关。
