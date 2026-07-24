# 世界电影数字地图 — 开发任务清单

按 PRD §20 分 15 个阶段推进。每阶段完成后更新状态。

---

## 阶段 1：项目与页面骨架 ✅

**目标**：可运行的 Next.js 工程 + 4 个路由占位 + 全局布局

**涉及文件**：
- `package.json`, `app/layout.tsx`, `app/page.tsx`
- `app/country/[countryCode]/page.tsx`, `app/film/[filmId]/page.tsx`, `app/people/page.tsx`
- `components/layout/Header.tsx`, `app/globals.css`

**验收**：`npm run dev` 可访问全部路由；Header 含产品名与「世界电影群像」链接

**状态**：done

---

## 阶段 2：TypeScript 数据类型 ✅

**目标**：`types/cinema.ts` 定义全部核心类型

**涉及文件**：`types/cinema.ts`

**验收**：`npm run build` 通过

**状态**：done

---

## 阶段 3：本地示例数据 ✅

**目标**：6 国、30 片、12 人、6 类型 JSON 数据

**涉及文件**：`data/*.json`, `lib/data.ts`

**验收**：外键关联可解析

**状态**：done

---

## 阶段 4：基础 3D 地球 ✅

**目标**：可旋转地球 + 星空背景

**涉及文件**：`components/globe/CinemaGlobe.tsx`, `GlobeControls.tsx`

**验收**：首页可见可交互 3D 地球

**状态**：done

---

## 阶段 5：经纬度转球面坐标 ✅

**目标**：独立 geo 工具函数

**涉及文件**：`utils/geo.ts`

**验收**：坐标转换逻辑独立可复用

**状态**：done

---

## 阶段 6：影片星光 ✅

**目标**：球面星光点 + 点击选中

**涉及文件**：`components/globe/FilmStars.tsx`

**验收**：地球表面可见星光，点击有高亮

**状态**：done

---

## 阶段 7：年份滑杆 ✅

**目标**：1920–2025 单年选择 + 星光过滤

**涉及文件**：`components/timeline/YearSlider.tsx`, `store/useMapStore.ts`

**验收**：拖滑杆仅显示对应年份星光

**状态**：done

---

## 阶段 8：国家与类型筛选 ✅

**目标**：组合筛选 + 清除 + EmptyState

**涉及文件**：`components/filters/FilterPanel.tsx`, `utils/filmFilters.ts`

**验收**：筛选后星光数量与数据一致

**状态**：done

---

## 阶段 9：影片预览卡片 ✅

**目标**：桌面右侧 / 移动底部预览卡

**涉及文件**：`components/film/FilmPreviewCard.tsx`

**验收**：点击星光显示完整预览信息

**状态**：done

---

## 阶段 10：影片详情页 ✅

**目标**：完整字段 + 返回地图保留状态

**涉及文件**：`app/film/[filmId]/page.tsx`, `components/film/FilmDetail.tsx`

**验收**：详情页字段完整，返回链接带 query 参数

**状态**：done

---

## 阶段 11：本地喜欢功能 ✅

**目标**：localStorage 持久化 + 跨页面同步

**涉及文件**：`components/film/LikeButton.tsx`, `store/useMapStore.ts`

**验收**：点赞刷新后保留

**状态**：done

---

## 阶段 12：国家电影页面 ✅

**目标**：国家简介、影片列表、人物、类型分布

**涉及文件**：`app/country/[countryCode]/page.tsx`, `components/country/CountryPageClient.tsx`

**验收**：6 国均可访问

**状态**：done

---

## 阶段 13：世界电影人物时间轴 ✅

**目标**：横向时间轴 + 国家/职业筛选

**涉及文件**：`app/people/page.tsx`, `components/timeline/PeopleTimeline.tsx`

**验收**：横向浏览，点击显示人物详情

**状态**：done

---

## 阶段 14：移动端适配 ✅

**目标**：筛选抽屉、底部预览卡、触控优化

**涉及文件**：`components/map/MapHomeClient.tsx`, 响应式样式

**验收**：375px 宽度可完成主要操作

**状态**：done

---

## 阶段 15：测试与优化 ✅

**目标**：构建通过、无 TS 错误、PRD 验收

**验收**：`npm run build` + `npm run lint` 通过

**状态**：done
