---
tags:
  - frontend/Mapbox
  - frontend/Three
  - HouseViz
---

你已经有 **React 基础**，目标是用 **Mapbox + Three.js** 做 **日照模拟应用**。这类应用的关键是：

1. **Mapbox 提供底图 + 建筑 footprint / 高度**
    
2. **Three.js 提供太阳光 / 阴影模拟**
    
3. 两者通过 **坐标系对齐** 结合
    

我帮你设计一个 **学习 Mapbox 的最小路径**，重点聚焦“地图 + 建筑 + React 集成”，不要学过多与日照无关的东西。

---

# 🎯 最终目标

React 页面能：

- 显示 Mapbox 地图
    
- 渲染 3D 建筑
    
- 利用 SunCalc 计算太阳位置
    
- Three.js 投射建筑阴影（而不仅仅是 Mapbox 的 fake shading）
    

---

# 🚀 学习路径

## **第 1 步：Mapbox 基础（1 天）**

- 注册 [Mapbox 账号](https://account.mapbox.com/)，获取 **accessToken**
    
- 安装依赖：
    
    ```bash
    npm install mapbox-gl
    ```
    
- 学习基本 API：
    
    - `new mapboxgl.Map({ ... })` 初始化地图
        
    - `style: "mapbox://styles/mapbox/standard"`（最新 Standard 样式，支持 3D 建筑）
        
    - `map.addControl(new mapboxgl.NavigationControl())` 添加缩放旋转
        
- 在 React 里创建一个 Mapbox 组件：
    
    ```jsx
    import mapboxgl from "mapbox-gl";
    import { useEffect, useRef } from "react";
    
    mapboxgl.accessToken = "YOUR_TOKEN";
    
    export default function Map() {
      const mapContainer = useRef(null);
      useEffect(() => {
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/standard",
          center: [116.397, 39.908], // 北京
          zoom: 15,
          pitch: 60,
        });
        return () => map.remove();
      }, []);
      return <div ref={mapContainer} className="w-full h-screen" />;
    }
    ```
    

✅ 成果：React 页面里能看到一个可缩放的 3D 地图。

---

## **第 2 步：Mapbox 3D 建筑（1 天）**

- 在 Mapbox 中，建筑通过 **`fill-extrusion` layer** 渲染
    
- 学习如何在 style 中控制建筑高度、颜色、透明度
    
- 尝试修改 `light`（Mapbox 内置光照）：
    
    ```js
    map.setLight({
      anchor: "map",
      color: "white",
      intensity: 0.5,
      position: [1.15, 210, 30] // 方位角、高度角
    });
    ```
    

✅ 成果：能手动修改光照方向，让建筑看起来像被太阳照射。

---

## **第 3 步：Mapbox + Three.js 集成（2 天）**

- 学习 Mapbox 的 **CustomLayer API**
    
    - `map.addLayer({ type: "custom", renderingMode: "3d", onAdd, render })`
        
    - 在 `onAdd` 里初始化 Three.js 场景、相机、灯光
        
    - 在 `render` 里用 Mapbox 的 `matrix` 同步 Three.js 相机
        
- 学习坐标转换：
    
    - `mapboxgl.MercatorCoordinate.fromLngLat([lng, lat], height)` → Three.js 坐标
        
- 用 Three.js 在地图上放一个 Box，确认能与建筑对齐
    

👉 官方示例：[Mapbox + Three.js custom layer](https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/)

✅ 成果：能把一个 Three.js 物体（如建筑）精确放在地图上。

---

## **第 4 步：太阳光与日照模拟（2 天）**

- 用 [SunCalc](https://github.com/mourner/suncalc) 计算太阳 azimuth / altitude
    
- 在 Three.js 里创建 `DirectionalLight`，开启阴影
    
- 建筑用 Three.js 渲染（extrude footprint），开启 `castShadow`
    
- 地面用 `receiveShadow` → 投影真实阴影
    
- UI：React datetime picker / slider → 调整时间 → 更新 SunCalc → 更新光照
    

✅ 成果：建筑在地图上，阴影随时间变化。

---

## **第 5 步：React 优化与进阶（2 天）**

- 把 Mapbox 容器和 Three.js 场景封装成 React 组件
    
- 增加交互：
    
    - 时间轴拖动 → 动态日照变化
        
    - 经纬度输入 → 不同城市日照模拟
        
- 优化性能：
    
    - 控制阴影贴图分辨率
        
    - 只渲染 ROI（区域内的建筑）
        

---

# 📌 总结学习路径

|阶段|时间|内容|成果|
|---|---|---|---|
|Step1|1 天|Mapbox 初始化|React + Mapbox 地图|
|Step2|1 天|3D 建筑 & 光照|Mapbox 自带 3D 建筑|
|Step3|2 天|Mapbox + Three.js Custom Layer|在地图上放置 Three.js 建模|
|Step4|2 天|太阳光照模拟|建筑阴影随时间变化|
|Step5|2 天|React 集成优化|可交互的日照模拟应用|

---

⚡ 如果你每天 2 小时，**一周就能跑通最小版本**，两周能做成完整 Demo。

要不要我帮你写一个 **Mapbox + Three.js CustomLayer 最小可运行示例（React 版）**，你可以直接作为 Day3 的起点？