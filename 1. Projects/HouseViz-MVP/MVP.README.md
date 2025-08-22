---
tags:
  - HouseViz/MVP
aliases: "#HouseViz/MVP"
---
%%Set the project deadline and its result description%%
- [ ] deadline 📅 2025-11-11
- key result> 单人全栈（熟悉 Next.js / Mapbox / Three.js），按周估算：

- **Week 0**：准备与环境（Mapbox key, Next.js scaffold, Overpass helper） — 1–2 天
    
- **Week 1**：2D 地图界面 + 点击建筑并 fetch footprint + 弹出基础 info — 4–5 天
    
- **Week 2**：实现“楼层判定 + 弹表单输入（层数/总层） + 本地验证”流程 — 3–4 天
    
- **Week 3**：实现客户端快速建模（Three.js）并在 modal 中展示简单 extrude（所选建筑 + 周边） — 5–7 天
    
- **Week 4**：实现时间轴（suncalc）与快速阴影投影算法（WebWorker），动画流畅性调优 — 5–7 天
    
- **Week 5**：分享短链 / 保存模型 / 简易导出截图（PNG） + Stripe 初版（订阅/付费） — 4–6 天
    
- **Week 6**：Bugfix、性能优化、设备兼容、基础测试 → 可上线 MVP — 4–7 天
    

**总计 MVP 时间：约 4–6 周**（视你每天可投入时长而定）。服务器端高精度渲染/报告另行 2–6 周或更多。

## Task
%%Query tasks based on the tags field of the [Properties](https://help.obsidian.md/Editing+and+formatting/Properties) of the current file, extracted from all the notes%%
```LifeOS
TaskListByTag
```

## Bullet
%%Query bullets based on the tags field of the [Properties](https://help.obsidian.md/Editing+and+formatting/Properties) of the current file, extracted from all the notes%%
```LifeOS
BulletListByTag
```

## File
%%Query files based on the tags field of the [Properties](https://help.obsidian.md/Editing+and+formatting/Properties) of the current file, extracted from all the notes%%
```LifeOS
FileListByTag
```
