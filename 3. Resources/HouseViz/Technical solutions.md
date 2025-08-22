太好了——我把你给的交互细节（2D 平面地图点选建筑 → 判断高层弹表单输入层数/总层数 → 基于输入与周围建筑生成 3D 模型 → 在大屏 3D 弹窗里做时间轴日照模拟）当作 **产品规范的核心流程**，并据此重做一份深度技术方案：包含架构图、交互序列、算法思路、数据源与合规要点、前后端接口、性能/缓存策略、异常与回退处理、以及独立开发者的实现路线与工期估算。

我会把方案写成工程师能立刻落地的规格。下面先给结论与关键点摘要，然后逐节展开细节。

---

# 结论（要点）

- 技术栈仍然以 **Next.js (前后端同构) + Mapbox (2D 地图/地物数据) + Three.js（/WebGL）** 作为主线最为合理：Mapbox 负责 2D 地图、地址/要素点选与建筑 footprint 获取；Three.js 在“大屏弹窗”中做 3D 建模与日照可视化。
    
- 对“高层判定 + 层数校验”的逻辑应以 **OSM/Mapbox 提供的 building:levels/height 为首选参考源**，若缺失则基于默认楼层高度估算并让用户输入/覆盖。高层阈值可配置（建议默认 6 层）。
    
- **建模分两级**：客户端即时近似建模（用于交互与动画）＋服务器端高精度渲染/报告（用于导出与付费报告）。
    
- 阴影/日照计算建议采用 **基于太阳向量的多时步投影（快速）＋ 点/面可视检测（精确）** 的混合方案；C 端交互使用快速投影以保持流畅，付费报告使用服务器高精度光线相交（ray-casting）或离线渲染。
    
- 需要注意数据与授权合规（不要用 Google Photorealistic 3D Tiles 做衡量/测量），优先使用 OSM / Mapbox / 本地测绘或购得的 BIM/3D 数据做高精度部分。
    

下面进入详细规格。

---

# 一、交互序列（用户故事→系统动作）

1. 用户在 2D 地图上浏览并**点击某建筑（单体）**。
    
2. 前端调用后台/向量切片获取该建筑的 footprint、已有属性（`building:levels`、`height`、`osm id`、`building:material` 等）。
    
3. 系统做“高层判定”：
    
    - 若 `building:levels` 或 `height` 存在并超过阈值（默认 6 层 / 18 m），判定为“高层”；否则判定为“低层/中低层”。
        
    - 若属性缺失或不确定，视为**未知**并提示用户输入楼层信息（强烈建议引导用户输入）。
        
4. 若是**高层或未知**，弹出小窗表单，提示用户输入：
    
    - **所居层数（必填）**
        
    - **建筑总层数（建议填 / 用于校验）**
        
    - （可选）楼层高度（默认 3.0m，用户可切换 Residential/Commercial）
        
    - 表单含“与地图数据不符”提示（若检测到已有数据差距）。
        
5. 用户提交，前端做 quick validation（整数范围、所居层 ≤ 总层等）。
    
6. 系统确认后，进入 **3D 大屏弹窗（modal / route）**：
    
    - 后端或前端开始生成 3D 模型：选中建筑 + 周边建筑（半径 R，默认 100m） → 建模完成后显示三维场景（可旋转/缩放/切换材质）。
        
7. 在 3D 弹窗中，用户可操作**时间轴控件**（小时/日/季/年动画）来观察阴影变化与采光。
    
8. 用户可导出报告（需登录/付费），或分享链接（生成带参数的短链，可再现建模场景）。
    

---

# 二、整体架构图（文字+模块示意）

```
[CLIENT - Next.js SPA]
  ├─ Map UI (Mapbox GL JS)  <-- 2D 平面地图、建筑点选、draw工具
  ├─ Modal 3D Viewer (Three.js)  <-- 大屏弹窗的 3D 场景
  ├─ TimeAxis Controller (local)  <-- 控制 sun position 时序
  └─ WebWorker(s)  <-- 处理建模/阴影投影计算，避免阻塞主线程

[API / Backend - Next.js API routes or Node service]
  ├─ /api/footprint?osm_id=   <-- returns GeoJSON + metadata (levels/height)
  ├─ /api/buildings/nearby?bbox=  <-- fetches surrounding footprints
  ├─ /api/model/generate  <-- optional: server-side high-precision model job
  ├─ /api/report/generate   <-- server-side PDF/render job queue
  └─ Auth / Billing / Storage (Stripe, S3, Redis queue)

[Data Sources]
  ├─ Vector Tiles / Mapbox (footprints + extruded building data)
  ├─ OSM Overpass (backup footprints, building:levels)
  ├─ (Optional) Purchased BIM / LiDAR / City data for high-precision markets
  └─ Suncalc solar library or custom sun position module

[Background/Worker]
  ├─ Job queue (BullMQ/Redis) for heavy render/report
  ├─ Headless renderer (Three.js + Puppeteer / offscreen GL) or Blender for photorealism
  └─ Cache layer (CDN) for generated scenes/reports
```

---

# 三、每个模块详述与实现细节

## 1) 2D 地图层（Mapbox）

- **职责**：显示街区/楼栋平面，响应点击，显示建筑信息弹窗（轻量）。
    
- **数据获取**：先尝试 Mapbox vector tiles 的 building 图层（含 `id`，部分地区含 `height`），若缺失则调用 Overpass API (OSM) 拉取 building polygon 与 `building:levels`。
    
- **点选逻辑**：
    
    - 点击点（屏幕坐标） → Mapbox `queryRenderedFeatures` 查找 building layer feature → 返回 feature.properties（osm_id, height, levels）并传到前端表单模块。
        
    - 若 query 没找到，弹出“手动绘制建筑边界（draw）”工具供用户绘制多边形。
        

## 2) 高层判定与层数校验（Frontend quick logic）

- **判定逻辑（示例）**：
    
    - if `feature.properties.height` exists and height >= `HIGH_RISE_HEIGHT` (e.g., 18m) → high-rise.
        
    - else if `feature.properties['building:levels']` exists and levels >= `HIGH_RISE_FLOORS` (e.g., 6) → high-rise.
        
    - else if missing → unknown → 强制用户输入层/总层。
        
- **层高转换**：默认 `floorHeight = 3.0m`（住宅），若用户选择商业或特殊则 3.5m。`computedHeight = totalFloors * floorHeight`。
    
- **不一致处理**：若 `abs(computedHeight - feature.height) > tolerance`（tolerance e.g., 2m），在表单显示“地图数据与您输入不符：地图高度 X m，您输入约 Y m，是否以您输入为准 / 使用地图数据 / 选择联系人工核验”。
    

## 3) 用户输入表单 UX 要点

- 强制校验：`1 <= floor <= totalFloors <= 100`（上限可 configurable）。
    
- 提示与默认：若用户不知道总层数，允许“我不知道”，则把该建筑标为“需估算”，并用 `estimatedTotalFloors = Math.ceil( buildingHeight / floorHeight )`。
    
- 记录版本：把用户输入与原始来源都存在模型元数据里（供后续可审计 / 分享）。
    

## 4) 3D 建模（客户端即时建模 + 可选服务端精模）

**客户端即时建模（用于交互）**

- **输入**：建筑 footprint (GeoJSON), 周边 footprints, 每栋建筑高度（use feature.height or estimated from levels*floorHeight), material default.
    
- **生成方法**：使用 Three.js 的 `ExtrudeGeometry` 或 `BufferGeometry` 将平面多边形按高度拉伸成建筑体块，生成顶面与侧面材质（简化材质，避免复杂 UV）。
    
- **环境**：地面平面 z=0，单位米坐标需转换（lon/lat → WebMercator → meters）。
    
- **周边建筑范围**：默认半径 R=100m（或按 bbox 扩展到视口），从后端获取附近 footprints。
    
- **性能处理**：大量复杂多边形要简化：先用 `turf.simplify` 或 similar 减少顶点。并在 WebWorker 做建模，主线程只渲染结果。
    

**服务器端高精度建模（可选，付费/报告）**

- 用更高精度数据（BIM/LiDAR）或更复杂网格（quadtrees/3D tiles），在后台渲染生成光照阴影序列或栅格化日照小时数，输出 PDF/PNG。可用 headless GL 或后台渲染集群（或 Blender + Python 渲染脚本）做高质量可视化和量化报告。
    

## 5) 日照/阴影计算算法（混合方案）

**A. 交互层快速阴影投影（客户端，实时）**

- 对每个建筑体块的顶点 `v = (x,y,z)`，和太阳方向向量 `s = (sx, sy, sz)`（z < 0 toward ground）计算其投影到地面的点：
    
    - 求 `t = -v.z / s.z`，投影点 `p = v + t * s`。
        
    - 对每栋建筑取其顶点投影，得到阴影多边形（需合并相交多边形）。
        
- 对平面上的渲染，阴影层表现为半透明的黑色多边形（或热力色映射）。
    
- 时间轴上每个时间点都重新计算并渲染。计算复杂度与建筑顶点数成正比，但在大多数城市块内是可控的。
    

**B. 点可视性检测（客户端/服务器，精确度高）**

- 对要量化“某窗户/某面在给定时间是否被遮挡”的问题，使用射线相交：从点 P(窗户/检测点)向太阳方向 `-s` 发一条射线，检查是否与其他建筑体相交；若有相交，则被遮挡。
    
- 这个方法在客户端可对少量检测点做快速检查；对大量点（例如网格采样计算每日日照小时数）建议在服务器端批处理。
    

**C. 离线/报告级全天日照小时计数**

- 对目标点或面进行时间离散（例如每小时或每 10 分钟），对每个时间步运行点可视检测并计数暴露时间，得到年/季日照小时数。服务器端可对大量点并行处理并返回热力图与统计。
    

## 6) 分享/可复现模型

- 将所有 input（地理位置、osm_id、用户输入层数、floorHeight、timestamp）做成一个短链参数集（可以用短链服务或加密 JSON 存到 DB 并返回 id），以便别人打开链接时复现完全相同的 3D 场景与时间轴状态。
    
- 对于付费报告，保存渲染结果与报告版本以便法务/用户投诉时核验。
    

---

# 四、前后端接口（示例 API 设计）

（用 Next.js API Routes 或独立 Node 服务均可）

1. `GET /api/feature?lat=..&lon=..`
    
    - 返回：`{ feature: GeoJSONFeature | null, source: 'mapbox'|'osm' }`
        
2. `POST /api/validate-floors`
    
    - body: `{ osm_id, totalFloors, userFloor, floorHeight }`
        
    - 返回：`{ ok: true, computedHeight, mapHeight, discrepancy, action: 'accept'|'confirm'|'use_map' }`
        
3. `POST /api/model/quick`
    
    - body: `{ featureGeoJSON, nearbyGeoJSON[], overrides: { osm_id: { height }}, options }`
        
    - returns: quick 3D mesh data (binary or JSON geometry) or jobId if server-side.
        
4. `POST /api/model/full` (heavy)
    
    - body: similar → enqueue job (returns jobId), job finishes → stores result in S3 / CDN, returns download link.
        
5. `GET /api/sun/shadow?time=ISO&bbox=..&modelId=..`
    
    - 返回 GeoJSON of shadow polygons for given time.
        
6. Auth/Billing endpoints with Stripe.
    

---

# 五、性能、用户体验与优化策略

- **客户端建模**：在前端做近似建模（低顶点网格）并用 WebWorker 做几何计算；用 requestAnimationFrame 控制渲染帧率以避免卡顿。
    
- **LOD（Level of Detail）**：根据相机距离和设备能力动态降低几何复杂度。
    
- **预计算缓存**：对热门地址或已生成场景做缓存（shadow polygons per time-step），用 CDN 返回。
    
- **分步渲染**：先显示轮廓 + 估算高度，再渐进式加载细节（纹理、精细几何）。
    
- **Fallback**：若 Mapbox/OSM 无建筑数据，提供手绘工具；若用户手机性能差，切换到 2D 投影动画而不是三维。
    
- **资源限制**：对免费用户限制生成次数 / 并行 jobs 数量，防止滥用计算资源。
    

---

# 六、数据许可与合规（重点）

- **不要把 Google Photorealistic 3D Tiles 用于测量/导出/分析用途**（见先前讨论）。
    
- 合法可用的数据源：**OSM（开放）、Mapbox 矢量瓦片（遵守 Mapbox 条款）**，以及通过付费渠道获得的市政 LiDAR/BIM 数据（按授权）。
    
- 在 UI/报告中明确「数据来源 & 精度说明」：例如“本结果基于 OSM-building 与用户输入估算，仅供参考；正式合规报告请购买高精度服务”。
    
- 如果要对接本地市政数据（如 LiDAR），需要签订数据使用协议并遵守保密/版税条款。
    

---

# 七、错误场景与用户引导（UX 冗余处理）

- **地图无建筑/footprint 异常**：引导用户手绘边界，显示“我们无法自动获取此建筑轮廓，请手动绘制或上传平面图”。
    
- **用户输入与地图数据差别很大**：提示明显冲突并提供选择：使用地图、使用用户输入、或请求专家核验（付费）。
    
- **建模超时/失败**：提供失败原因和降级体验（比如仅显示 2D 年度热力图，而非 3D）。
    
- **隐私**：不要公开用户个人信息；保存历史操作需用户授权。
    

---

# 八、单人开发路线与工期估算（独立开发者，Lean MVP）

> 假设你是单人全栈（熟悉 Next.js / Mapbox / Three.js），按周估算：

- **Week 0**：准备与环境（Mapbox key, Next.js scaffold, Overpass helper） — 1–2 天
    
- **Week 1**：2D 地图界面 + 点击建筑并 fetch footprint + 弹出基础 info — 4–5 天
    
- **Week 2**：实现“楼层判定 + 弹表单输入（层数/总层） + 本地验证”流程 — 3–4 天
    
- **Week 3**：实现客户端快速建模（Three.js）并在 modal 中展示简单 extrude（所选建筑 + 周边） — 5–7 天
    
- **Week 4**：实现时间轴（suncalc）与快速阴影投影算法（WebWorker），动画流畅性调优 — 5–7 天
    
- **Week 5**：分享短链 / 保存模型 / 简易导出截图（PNG） + Stripe 初版（订阅/付费） — 4–6 天
    
- **Week 6**：Bugfix、性能优化、设备兼容、基础测试 → 可上线 MVP — 4–7 天
    

**总计 MVP 时间：约 4–6 周**（视你每天可投入时长而定）。服务器端高精度渲染/报告另行 2–6 周或更多。

---

# 九、量化参数与默认配置（建议可调）

- `HIGH_RISE_FLOORS = 6`（高层阈值）
    
- `DEFAULT_FLOOR_HEIGHT_RESIDENTIAL = 3.0 m`
    
- `DEFAULT_FLOOR_HEIGHT_COMMERCIAL = 3.5 m`
    
- `NEARBY_BUILDING_RADIUS = 100 m`（或 bbox 视图范围）
    
- `TIME_STEP_SECONDS = 3600`（交互：按小时；报告：可设 10/30/60 分钟）
    
- `MAX_VERTICES_PER_BUILDING = 512`（简化阈值）
    

---

# 十、下一步（我可以立刻帮你做的 3 件事）

1. 把上面架构拆成 **详细任务卡（Jira/Trello）**，包括文件、API contract、前端组件 props、worker contracts；并给每个卡做前后端实现提示与代码片段（若需要）。
    
2. 给你写一段 **WebWorker 中做阴影多边形投影的高质量模板代码**（Three.js + suncalc + turf 集成），便于直接粘贴到项目中。
    
3. 做一次 **端到端演示原型（轻量）** 的实现计划：我把关键 React 组件的 props / state / hooks / worker 接口列成代码级规格，供你按周实现。
    

你想让我先做哪一项？（选 1 / 2 / 3 或都做 — 我就立刻开始做第一项）