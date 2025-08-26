---
tags:
  - frontend/Three
  - frontend/React
  - "#HouseViz"
---


好的 👍 你有 **React 基础**，目标是用 **Three.js 做日照模拟**。我帮你设计一个 **最小学习路径**，重点围绕“建筑 + 太阳位置 + 阴影”，不学多余的 Three.js 花哨内容。

---

# 🎯 最终目标

做一个 React 网页：

1. 渲染一片建筑（extrude footprint → 3D 建筑）
    
2. 输入时间 & 经纬度 → 计算太阳方位角、高度角
    
3. 用太阳光照 (`DirectionalLight`) 投射建筑阴影
    
4. 在页面上能交互调整时间，看到阴影变化
    

---

# 🚀 学习路径

## 第 1 步：Three.js 必学核心（1–2 天）

只看核心，不要贪多。

- **场景**（`THREE.Scene`）、**相机**（`PerspectiveCamera`）、**渲染器**（`WebGLRenderer`）
    
- **几何体 & 材质 & 网格**（比如 `BoxGeometry + MeshStandardMaterial`）
    
- **光照**：`DirectionalLight`（太阳）、`AmbientLight`（环境光）
    
- **阴影**：`renderer.shadowMap.enabled = true`，网格开启 `castShadow` / `receiveShadow`
    
- **控制器**：`OrbitControls`（拖拽旋转场景）
    

👉 学习资源：

- [Three.js 文档 Getting Started](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)
    
- YouTube 上 “Three.js Crash Course”
    

---

## 第 2 步：日照模拟核心（2–3 天）

1. **太阳位置计算**
    
    - 用 [SunCalc](https://github.com/mourner/suncalc)
        
    - 输入：经纬度 + 日期时间
        
    - 输出：`azimuth`（方位角）、`altitude`（高度角）
        
    
    ```js
    import SunCalc from "suncalc";
    const times = SunCalc.getPosition(new Date(), lat, lng);
    const azimuth = times.azimuth;   // 弧度，0 = 南
    const altitude = times.altitude; // 弧度，0 = 地平线
    ```
    
2. **转成 Three.js 光照方向**
    
    ```js
    const r = 100; // 太阳距离
    const x = r * Math.cos(altitude) * Math.sin(azimuth);
    const y = r * Math.sin(altitude);
    const z = r * Math.cos(altitude) * Math.cos(azimuth);
    light.position.set(x, y, z);
    ```
    
3. **阴影投射**
    
    - 给太阳光 `castShadow = true`
        
    - 给建筑物 `castShadow = true`
        
    - 给地面 `receiveShadow = true`
        

---

## 第 3 步：建筑建模（2–3 天）

- **简易版本**：直接用 `BoxGeometry` 模拟几个建筑物
    
- **真实版本**：
    
    - 拿到 footprint（GeoJSON from OSM/Mapbox）
        
    - 转成 `THREE.Shape`
        
    - 用 `ExtrudeGeometry` 拉伸出 3D 建筑
        

👉 练习：渲染一个街区，建筑会在地面投影。

---

## 第 4 步：React 集成（2–3 天）

你有 React 基础，推荐 **react-three-fiber (R3F)**，它把 Three.js 封装成 React 组件，写法更自然：

- **核心库**：[react-three-fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
    
- **辅助库**：[drei](https://github.com/pmndrs/drei)（提供 OrbitControls、Sky 等现成组件）
    

👉 基本骨架：

```jsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function App() {
  return (
    <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <directionalLight
        castShadow
        position={[10, 10, 10]}
        intensity={1}
        shadow-mapSize={[2048, 2048]}
      />
      <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.5} />
      </mesh>
      <OrbitControls />
    </Canvas>
  );
}
```

👉 然后在 React state 里保存 `date`，用 SunCalc 计算光照，更新 `directionalLight.position`。

---

## 第 5 步：进阶（可选）

- 加 **UI 控制**：React datetime picker → 调整时间 → 更新太阳光照
    
- 加 **Mapbox 地图底图**，Three.js 在上层渲染建筑阴影
    
- 加 **地形（DEM）**，用 plane + heightmap
    
- 加 **材质**：玻璃、金属、PBR
    

---

# 📌 总结学习路径

1. **Three.js 基础**：场景/相机/光照/阴影
    
2. **SunCalc 日照计算**：根据经纬度+时间 → 太阳角度
    
3. **建筑建模**：Box / ExtrudeGeometry
    
4. **React + R3F**：封装成 React 组件，UI 控制太阳位置
    
5. **进阶**：地形、材质、性能优化
    

---

⚡ 如果每天投入 2 小时，**1 周能做出最小原型**，**2 周能做出可交互的日照模拟应用**。

要不要我帮你写一个 **学习任务清单（Day1~Day7，每天一个目标 + 小任务）**，这样你可以按天推进？


好 ✅ 我给你设计一个 **7 天学习任务清单**（Day1 ~ Day7），结合 **React + Three.js (react-three-fiber)**，目标是最终完成一个 **日照模拟应用**。每天只需 1–2 小时，坚持一周就能跑通。

---

# 🗂 学习任务清单（React + Three.js 日照模拟）

---

### **Day 1 — Three.js & React 基础**

🎯 目标：跑通最小的 Three.js 场景

- 安装依赖：
    
    ```bash
    npm install three @react-three/fiber @react-three/drei suncalc
    ```
    
- 新建 React 项目（`vite` 或 `create-react-app`）
    
- 用 `Canvas` 渲染一个立方体，可以旋转视角：
    
    ```jsx
    import { Canvas } from '@react-three/fiber';
    import { OrbitControls } from '@react-three/drei';
    
    function Box() {
      return (
        <mesh>
          <boxGeometry args={[1,1,1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      );
    }
    
    export default function App() {
      return (
        <Canvas camera={{ position: [3, 3, 3] }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Box />
          <OrbitControls />
        </Canvas>
      );
    }
    ```
    

✅ 成果：页面能显示一个 3D 方块，可拖拽旋转。

---

### **Day 2 — 光照与阴影**

🎯 目标：理解光照和阴影

- 打开阴影支持：`<Canvas shadows>`
    
- 用 `DirectionalLight` 模拟太阳光：
    
    ```jsx
    <directionalLight 
      castShadow 
      position={[10, 10, 10]} 
      intensity={1} 
    />
    ```
    
- 建立地面：`planeGeometry`，开启 `receiveShadow`
    
- 给立方体开启 `castShadow`
    

✅ 成果：立方体在地面投射阴影。

---

### **Day 3 — 太阳位置计算**

🎯 目标：能根据时间计算太阳方位角 & 高度角

- 引入 `suncalc`：
    
    ```js
    import SunCalc from "suncalc";
    
    const pos = SunCalc.getPosition(new Date(), 40.7128, -74.0060); // NYC
    console.log(pos.azimuth, pos.altitude);
    ```
    
- 把 azimuth & altitude 转换成 Three.js 光源位置：
    
    ```js
    const r = 50; // 光源距离
    const x = r * Math.cos(pos.altitude) * Math.sin(pos.azimuth);
    const y = r * Math.sin(pos.altitude);
    const z = r * Math.cos(pos.altitude) * Math.cos(pos.azimuth);
    ```
    
- 把这个 `[x,y,z]` 传给 `<directionalLight position={...} />`
    

✅ 成果：改变时间，太阳光方向改变，阴影方向也改变。

---

### **Day 4 — 建筑建模**

🎯 目标：用 ExtrudeGeometry 渲染建筑

- 简单：用多个 `BoxGeometry` 代表不同高度的建筑
    
- 进阶：从 **GeoJSON footprint** 转成 `Shape` + `ExtrudeGeometry`
    
    ```jsx
    import * as THREE from "three";
    function Building({ footprint, height }) {
      const shape = new THREE.Shape();
      footprint.forEach(([x, y], i) => {
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: height });
      return (
        <mesh geometry={geometry} castShadow>
          <meshStandardMaterial color="lightgray" />
        </mesh>
      );
    }
    ```
    

✅ 成果：能在场景里渲染多个建筑，并随光照投射阴影。

---

### **Day 5 — React UI 控制**

🎯 目标：用 React state 控制太阳时间

- 用 `<input type="datetime-local" />` 控制时间
    
- 在 React state 里存储 `date`，用 `SunCalc.getPosition(date, lat, lng)` 更新光源位置
    
- 每次修改时间，建筑阴影变化
    

✅ 成果：可以交互修改时间，实时更新日照阴影。

---

### **Day 6 — 场景优化**

🎯 目标：让应用更真实更流畅

- 加 `Sky` 组件（`@react-three/drei` 提供），模拟天空颜色随太阳变化
    
- 用 `shadowMaterial` 渲染柔和阴影
    
- 优化光照参数（`shadow.mapSize`、`shadow.bias`）提升阴影质量
    

✅ 成果：太阳光照+阴影更真实，天空也随时间有变化。

---

### **Day 7 — 集成 & 展示**

🎯 目标：把日照模拟做成一个完整应用

- 增加地理位置输入（lat, lng） → 可模拟不同地点日照
    
- 做个时间轴（拖动 slider 改变一天中时间，阴影实时移动）
    
- 打包项目 → 部署到 Vercel/Netlify，分享 Demo
    

✅ 成果：一个完整的 **React + Three.js 日照模拟应用**！

---

# 🔑 总结

- **前 3 天**：熟悉 Three.js 基础 + 光照阴影 + SunCalc
    
- **中间 2 天**：建筑建模 + React 交互
    
- **最后 2 天**：优化体验 + 部署
    

一周时间，你就能从 0 到 1 搭建一个真实可用的日照模拟 Web App。

---

要不要我帮你把 **Day3 的太阳角度计算 + Three.js 灯光代码**写成一个完整的 React 示例？这样你可以马上跑起来看到阴影随时间变化。