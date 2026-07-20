# 客观评分再校准 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让五档评价在正常游玩中客观出现，并拉开评价金字与朱印的视觉间距。

**Architecture:** 保留现有连续时间评分曲线和生命档位上限，只更新十五关客观时间基准与生命扣分。生命扣分收敛为单一导出函数，评分和结算提示共同使用，避免两处规则漂移；视觉仅修改结算标题间距。

**Tech Stack:** TypeScript、Vite、Vitest、Playwright、CSS

## Global Constraints

- 切割次数不限，不参与扣分。
- 第 1 关 `fast/standard/relaxed` 为 `8/16/28` 秒。
- 第 15 关 `fast/standard/relaxed` 为 `42/66/106` 秒。
- 剩余 3/2/1 枚墨点分别扣 `0/12/28` 分。
- 结算金字与朱印之间保留约 10 像素空隙。
- 不改变当前五档文案、分数区间、动画顺序和存档结构。

---

### Task 1: 统一生命扣分规则

**Files:**
- Modify: `src/results/resultScoring.ts`
- Modify: `src/results/resultViewModel.ts`
- Test: `src/tests/resultScoring.test.ts`

**Interfaces:**
- Produces: `lifePenalty(lives: 1 | 2 | 3): 0 | 12 | 28`
- Consumes: `calculateLevelResult` 与结算晋级提示共同调用该函数。

- [ ] **Step 1:** 增加失败测试，验证两命扣 12 分、一命扣 28 分，且相同输入下切割次数不改变分数。
- [ ] **Step 2:** 运行 `npm test -- --run src/tests/resultScoring.test.ts`，确认新断言先失败。
- [ ] **Step 3:** 导出并复用 `lifePenalty`，删除评分与提示中的重复常量。
- [ ] **Step 4:** 重跑该测试文件，确认通过。

### Task 2: 校准十五关时间基准

**Files:**
- Modify: `src/levels/goldenLevel.ts`
- Test: `src/tests/levelContract.test.ts`

**Interfaces:**
- Produces: 每关稳定递增的 `LevelTiming`。
- Consumes: 现有 `LevelConfig.timing` 注入逻辑保持不变。

- [ ] **Step 1:** 增加边界测试，验证第 1 关为 `8/16/28` 秒、第 15 关为 `42/66/106` 秒，且三个阈值都随关卡严格递增。
- [ ] **Step 2:** 运行目标测试并确认旧表导致失败。
- [ ] **Step 3:** 一次性替换完整十五关时间表。
- [ ] **Step 4:** 重跑目标测试并确认通过。

### Task 3: 拉开结算标题与朱印

**Files:**
- Modify: `src/styles.css`
- Test: `tests/result-flow.spec.ts`

**Interfaces:**
- Produces: `.result-rank` 下方 10 像素间距。

- [ ] **Step 1:** 将 `.result-rank` 的负下边距改为 `10px`。
- [ ] **Step 2:** 构建并运行结算浏览器测试。
- [ ] **Step 3:** 生成结算截图，确认文字、朱印、分数面板无重叠且移动端画幅不溢出。

### Task 4: 全量验证与发布

**Files:**
- Verify: `src/**`
- Verify: `tests/**`
- Publish: GitHub Pages 根目录构建产物

- [ ] **Step 1:** 运行 `npm test -- --run`、`npm run build` 和 `npm run test:e2e`。
- [ ] **Step 2:** 检查联网仓库分支、远端差异和未跟踪文件，确认不会覆盖无关修改。
- [ ] **Step 3:** 同步完整 V2 源码与构建产物，提交并推送到 Pages 使用的分支。
- [ ] **Step 4:** 请求公网地址并确认返回成功，再交付手机端测试清单。
