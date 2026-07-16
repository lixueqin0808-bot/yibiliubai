# 外扩地图侧壁与定向光实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把内凹封边替换为外扩画板侧壁，并让普通切面、冷银锻钢护条、左上主光和右下投影使用同一套几何模型。

**Architecture:** `mapSidewall.ts` 只负责把顶面多边形转换成外扩轮廓和逐边侧壁；`Game.ts` 只负责按渲染顺序绘制阴影、侧壁和顶面。物理世界只保留顶面多边形，删除旧的内部金属障碍物。

**Tech Stack:** TypeScript、Canvas 2D、Vitest、Playwright、Vite。

## Global Constraints

- 顶面多边形是唯一的可玩、反弹与切割边界，不能因视觉侧壁缩小。
- 普通侧壁只用石墨灰材质并由左上主光调色；墨铁边用冷银锻钢护条替换同一侧壁。
- 投影必须来自外扩轮廓并偏向右下；不新增关卡、音效或地图素材。
- 每次代码修改后运行 `npm.cmd run build`、`npm.cmd run test`、`npm.cmd run test:e2e`。

---

### Task 1: 准备冷银锻钢护条资产

**Files:**
- Create: `scripts/prepare-external-sidewall-assets.py`
- Create: `src/assets/ink-silver-steel-edge-strip.webp`
- Test: 手工检查透明边缘与横向带状结构

**Interfaces:**
- Produces: `ink-silver-steel-edge-strip.webp`，供 `Game.ts` 的 `inkSilverSteelImage` 加载。

- [ ] 复制生成的 PNG 到项目临时素材位置。
- [ ] 使用现有去色流程把洋红背景变为 alpha，并裁切到带状主体。
- [ ] 转为 WebP，保留透明角和横向材质细节。
- [ ] 打开处理结果，确认没有洋红色边缘、没有端盖、没有投影。

### Task 2: 编写外扩侧壁几何并建立测试

**Files:**
- Create: `src/geometry/mapSidewall.ts`
- Create: `src/tests/mapSidewall.test.ts`

**Interfaces:**
- Produces: `buildMapSidewall(polygon, depth): MapSidewall`。
- `MapSidewall` 包含 `outerPolygon: Polygon` 与按原边顺序排列的 `faces: SidewallFace[]`。
- `SidewallFace` 包含 `innerStart`, `innerEnd`, `outerEnd`, `outerStart`, `outwardNormal`。

- [ ] 先写凸四边形测试：每条 `inner` 边保持原顶面边，外扩顶点都位于多边形外。
- [ ] 写凹多边形测试：外扩顶点有限，不出现 NaN、无穷大或超过最大斜接长度的尖刺。
- [ ] 实现逐边外法线、相邻外移直线交点和带上限的斜接算法。
- [ ] 运行单测，确认侧壁连续并保持原多边形不变。

### Task 3: 用外扩侧壁重写地图渲染

**Files:**
- Modify: `src/core/Game.ts`
- Test: `e2e/golden-level.spec.ts`

**Interfaces:**
- Consumes: `buildMapSidewall`、普通切面纹理、冷银锻钢纹理、`visibleBoundarySegments`。
- Produces: `drawMapShadow`、`drawMapSidewalls`、`drawTopSurface`。

- [ ] 将渲染顺序改为：外扩投影、全部侧壁、顶面、交互层。
- [ ] 删除 `drawInsetEdge`、`drawNormalBevelSegments` 与旧的 `drawMetalSegments` 实现。
- [ ] 对每个侧壁以外法线和左上光向量计算亮度，给普通切面叠加白/黑透明层。
- [ ] 对锁定边用冷银锻钢纹理绘制相同几何，并保留更高对比度的高光与凹槽。
- [ ] 顶面保留石墨纹理，添加非常轻的左上亮、右下暗渐层；用外扩轮廓绘制右下投影。
- [ ] 更新 Playwright 截图断言以验证冷银护条资源已加载，并重新截取第 4 关。
- [ ] 增加 1 至 15 关逐关进图和截图测试，覆盖锐角、凹角和墨铁封边组合。

### Task 4: 删除旧内嵌金属物理模型

**Files:**
- Modify: `src/core/Game.ts`
- Modify: `src/physics/PhysicsWorld.ts`
- Modify: `src/tests/physics.test.ts`

**Interfaces:**
- `PhysicsWorld` 构造器、`reset` 与 `setBoundary` 只接收顶面 `Polygon`。
- 物理反弹继续由 `polygon` 边界和墨刃半径决定。

- [ ] 删除 `metalObstacles` 和所有向物理世界传入内部梯形的调用。
- [ ] 移除 `PhysicsWorld` 的 `obstacles` 字段与障碍物距离检查。
- [ ] 将旧“撞内嵌金属短边”测试改为“靠近顶面原边时反弹”，确认视觉厚度不改变可玩范围。
- [ ] 保留切线触碰锁定原边的拒绝、火花和音效路径。

### Task 5: 验证、同步与交付

**Files:**
- Modify: `docs/superpowers/specs/2026-07-16-external-map-sidewall-lighting-design.md`
- Modify: `docs/superpowers/plans/2026-07-16-external-map-sidewall-lighting-implementation.md`
- Modify: Git 副本中对应 `v2` 文件

- [ ] 运行构建、Vitest、Playwright。
- [ ] 检查第 4 关截图：顶面不内缩，侧壁外扩，左上亮、右下暗，右下有阴影，银色护条可辨。
- [ ] 将已验证文件同步到 Git 副本；只暂存本轮相关文件，保留用户已有未跟踪文件。
- [ ] 提交并推送 `v2-golden-level`。
