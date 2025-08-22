好的，我将把整个架构拆成详细的任务卡并逐步给出实施计划。这个任务卡将涵盖所有关键模块，包括前后端实现、API 设计、数据流与交互流程，同时会提供代码片段、接口规范等具体细节，帮助你快速实现 MVP。

## 任务卡拆解（Jira/Trello 任务列表）

### **模块 1：基础地图与建筑选择（前端）**

#### 任务 1.1: **初始化地图**

- **目标**: 在前端使用 Mapbox 显示 2D 地图。
    
- **子任务**:
    
    1. 配置 Mapbox 环境并加载基础地图。
        
    2. 获取建筑物的 footprint 数据，显示建筑轮廓。
        
    3. 设置点击事件，允许用户选择建筑物并显示建筑信息。
        
- **参考代码**:
    
    ```javascript
    map.on('click', (e) => {
      const feature = map.queryRenderedFeatures(e.point, { layers: ['building'] })[0];
      if (feature) {
        fetchBuildingData(feature.id);
      }
    });
    ```
    

#### 任务 1.2: **点击建筑并获取建筑数据**

- **目标**: 获取选中建筑物的详细数据（如层数、建筑高度等）。
    
- **子任务**:
    
    1. 调用后端接口 `/api/feature` 获取建筑的层数、总高度等信息。
        
    2. 显示一个弹窗，让用户输入相关信息（如层数、楼层高度）。
        
- **参考代码**:
    
    ```javascript
    async function fetchBuildingData(osm_id) {
      const response = await fetch(`/api/feature?osm_id=${osm_id}`);
      const data = await response.json();
      showBuildingInfoPopup(data);
    }
    ```
    

### **模块 2：高层判定与表单输入（前端）**

#### 任务 2.1: **高层建筑判定逻辑**

- **目标**: 判断建筑是否为高层，并显示相关表单让用户输入楼层信息。
    
- **子任务**:
    
    1. 根据建筑物的 `building:levels` 或 `height` 属性判断建筑是否为高层。
        
    2. 如果是高层，显示表单让用户输入“所居层数”和“总层数”。
        
- **参考代码**:
    
    ```javascript
    function checkBuildingHeight(buildingData) {
      const height = buildingData.height || (buildingData.levels * 3);
      return height > 18;  // 高层判定（18m 或 6 层）
    }
    ```
    

#### 任务 2.2: **表单校验与交互**

- **目标**: 用户输入表单数据，进行基本的校验，确保层数合理。
    
- **子任务**:
    
    1. 显示表单并收集用户输入的层数和总层数。
        
    2. 验证用户输入的合法性（如总层数 > 居住层数，楼层高度符合标准等）。
        
- **参考代码**:
    
    ```javascript
    function validateFloorInput(userFloor, totalFloors) {
      return userFloor <= totalFloors && userFloor > 0;
    }
    ```
    

### **模块 3：3D 建模（前端）**

#### 任务 3.1: **实现 3D 建模与显示**

- **目标**: 根据建筑物的 footprint 数据和高度生成 3D 建模并展示。
    
- **子任务**:
    
    1. 使用 Three.js 在弹窗中生成 3D 建筑模型。
        
    2. 显示周围建筑物（使用 Mapbox 提供的建筑数据）。
        
- **参考代码**:
    
    ```javascript
    function create3DModel(footprint, height) {
      const geometry = new THREE.ExtrudeGeometry(footprint, { depth: height });
      const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    }
    ```
    

#### 任务 3.2: **创建周边建筑的 3D 模型**

- **目标**: 生成周围建筑物的模型。
    
- **子任务**:
    
    1. 调用后端接口 `/api/buildings/nearby` 获取周边建筑的 footprint 数据。
        
    2. 结合当前建筑生成完整的 3D 模型。
        
- **参考代码**:
    
    ```javascript
    async function fetchNearbyBuildings(bbox) {
      const response = await fetch(`/api/buildings/nearby?bbox=${bbox}`);
      const data = await response.json();
      return data.features;
    }
    ```
    

### **模块 4：时间轴与日照模拟（前端）**

#### 任务 4.1: **实现时间轴控件**

- **目标**: 在大屏弹窗中加入时间轴控件，用户可通过时间轴来查看不同时间的阴影变化。
    
- **子任务**:
    
    1. 使用 JavaScript 的 `Date` 对象处理不同时间段的太阳方位。
        
    2. 创建时间轴控件，允许用户拖动或选择不同时间，查看日照/阴影效果。
        
- **参考代码**:
    
    ```javascript
    function updateSunPosition(date) {
      const sunPosition = getSunPosition(date);
      updateShadows(sunPosition);
    }
    ```
    

#### 任务 4.2: **实现阴影投影算法**

- **目标**: 根据太阳的方位，投影阴影到地面。
    
- **子任务**:
    
    1. 计算太阳方位并根据每栋建筑的高度和位置投影阴影。
        
    2. 在 3D 场景中更新阴影显示，展示时间轴效果。
        
- **参考代码**:
    
    ```javascript
    function calculateShadow(buildingPosition, sunPosition) {
      const shadowLength = buildingHeight / Math.tan(sunPosition.altitude);
      return { x: shadowLength, y: shadowLength };  // 简单投影
    }
    ```
    

### **模块 5：后端 API 实现**

#### 任务 5.1: **建筑数据获取 API**

- **目标**: 提供建筑数据 API，包括建筑的 `height`、`levels` 等信息。
    
- **子任务**:
    
    1. 实现 `/api/feature` 路径，返回建筑物的 GeoJSON 数据和属性。
        
- **参考代码**:
    
    ```javascript
    app.get('/api/feature', async (req, res) => {
      const osmId = req.query.osm_id;
      const data = await fetchBuildingDataFromOSM(osmId);
      res.json(data);
    });
    ```
    

#### 任务 5.2: **周边建筑获取 API**

- **目标**: 提供周边建筑数据 API，用于生成 3D 模型。
    
- **子任务**:
    
    1. 实现 `/api/buildings/nearby` 路径，获取指定区域的周边建筑数据。
        
- **参考代码**:
    
    ```javascript
    app.get('/api/buildings/nearby', async (req, res) => {
      const bbox = req.query.bbox;
      const nearbyBuildings = await fetchNearbyBuildingsFromOSM(bbox);
      res.json({ features: nearbyBuildings });
    });
    ```
    

#### 任务 5.3: **日照模拟 API**

- **目标**: 提供基于时间戳的阴影计算 API，用于前端实时模拟。
    
- **子任务**:
    
    1. 实现 `/api/sun/shadow` 路径，接收时间戳和建筑数据，返回阴影坐标。
        
- **参考代码**:
    
    ```javascript
    app.get('/api/sun/shadow', (req, res) => {
      const { time, bbox } = req.query;
      const shadows = calculateShadows(time, bbox);
      res.json(shadows);
    });
    ```
    

---

### **模块 6：用户界面与交互设计**

#### 任务 6.1: **弹窗交互设计**

- **目标**: 设计并实现用户交互流程，包括建筑选择、信息输入、3D 展示与日照模拟。
    
- **子任务**:
    
    1. 在弹窗中展示建筑的基本信息。
        
    2. 设计表单界面，供用户输入所居楼层与总层数。
        
    3. 在 3D 模型中展示建筑物及周边环境。
        
    4. 实现时间轴控件与日照/阴影展示。
        

---

## 任务卡总结

- **阶段性任务**：根据模块拆解，你可以先实现最基本的功能：地图展示、建筑选择、简单层数校验和快速建模，逐步扩展到 3D 显示、日照模拟和高级功能。
    
- **工程时间**：预计第一阶段（基础功能开发）约 2–3 周，后续时间主要用于性能优化、功能补充与细节调整。
    

你可以按此顺序逐步开发并验证每一块功能，确保每个模块都能单独运行。若需要我提供更详细的代码或某个模块的具体实现，随