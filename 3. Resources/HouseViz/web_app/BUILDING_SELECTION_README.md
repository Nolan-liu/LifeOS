# 建筑物点选功能 - 实现文档

## 🎯 功能概述

按照技术方案文档的要求，我们已成功实现了建筑物点选功能的第一阶段：

- ✅ 当相机视距拉近到15级以上时，启用建筑物点选
- ✅ 鼠标点击建筑物时，弹窗显示建筑物属性
- ✅ 智能分析建筑物数据质量和高层建筑判定
- ✅ 集成多数据源（Maptiler 3D + OSM Overpass API）

## 🏗️ 架构实现

### 核心组件

1. **SimpleMap** (`components/maplibre/simple-map.tsx`)
   - 基础地图渲染组件
   - 建筑物点击检测逻辑
   - 视距控制和光标状态管理

2. **BuildingInfoPopup** (`components/maplibre/building-info-popup.tsx`) 
   - 建筑物属性展示弹窗
   - 数据质量分析显示
   - 高层建筑判定提示

3. **MaplibreDemo** (`components/maplibre/maplibre-demo.tsx`)
   - 主界面集成组件
   - 分析模式切换
   - 交互状态管理

### 数据服务

4. **BuildingDataService** (`services/building-data.ts`)
   - 建筑物数据分析逻辑
   - 高层建筑判定算法（6层/18米阈值）
   - 数据质量评估

5. **Overpass API** (`app/api/buildings/overpass/route.ts`)
   - OSM 建筑物数据查询接口
   - 支持半径查询和单个建筑详情

## 🎮 使用方法

### 1. 启用分析模式
- 点击左下角"建筑物分析模式"按钮
- 界面将显示分析模式已启用的提示

### 2. 缩放到合适级别
- 将地图缩放到15级或以上
- 光标将变为十字形，表示可以点选建筑物

### 3. 点击建筑物
- 点击任意建筑物
- 弹窗将显示该建筑物的详细属性：
  - 建筑类型、高度、楼层数
  - 材料、名称、OSM ID
  - 数据质量评估
  - 高层建筑判定

### 4. 进行日照分析
- 在弹窗中点击"日照分析"按钮
- 触发下一阶段的3D建模和日照模拟流程

## 🔧 技术细节

### 地图配置
```typescript
// 使用 Maptiler 3D 样式获取建筑物数据
const styleUrl = `https://api.maptiler.com/maps/3d/style.json?key=${apiKey}`;

// 查询建筑物图层
const features = map.queryRenderedFeatures(e.point, {
  layers: ['building', 'building-3d', 'building-extrusion']
});
```

### 高层建筑判定
```typescript
// 按技术方案：6层或18米以上为高层
const HIGH_RISE_FLOORS = 6;
const HIGH_RISE_HEIGHT = 18; // 米

const isHighRise = (levels >= HIGH_RISE_FLOORS) || (height >= HIGH_RISE_HEIGHT);
```

### 数据质量分析
- **完整**: 有高度和楼层数据
- **部分**: 缺少高度或楼层数据中的一项
- **估算**: 高度和楼层数据都缺失，使用默认值估算

## 🌍 数据源

### 主要数据源
1. **Maptiler 3D Buildings** - 全球建筑物3D数据
2. **OSM Overpass API** - 开源地图建筑物属性

### 数据字段映射
- `building:levels` / `levels` → 楼层数
- `building:height` / `height` → 建筑高度
- `building:material` → 建筑材料
- `building:type` / `building` → 建筑类型
- `name` → 建筑名称

## 🎨 UI/UX 特性

### 交互反馈
- 缩放级别提示
- 光标状态变化（十字形 → 指针）
- 分析模式状态指示器

### 数据可视化
- 高层建筑标识徽章
- 数据质量指示器（完整/部分/估算）
- 缺失数据的明确提示

### 响应式设计
- 弹窗自动定位
- 移动端适配
- 触摸操作支持

## 🚀 下一步开发

根据技术方案文档，接下来需要实现：

1. **楼层信息输入表单** - 高层建筑的详细楼层输入
2. **3D 建模系统** - Three.js 建筑物建模
3. **日照计算引擎** - 时间轴控制的阴影模拟
4. **分享和报告功能** - 生成分析报告

## 🔍 调试和测试

### 测试地点推荐
- **北京CBD**: `[116.4074, 39.9042]` - 高层建筑密集
- **上海陆家嘴**: `[121.4944, 31.2335]` - 超高层建筑群
- **深圳福田**: `[114.0579, 22.5431]` - 现代建筑群

### 调试工具
- 浏览器控制台显示建筑物点击信息
- 网络面板监控 API 调用
- MapLibre GL JS 调试工具

## 📞 支持

如有问题，请检查：
1. Maptiler API Key 是否正确配置
2. 浏览器是否支持 WebGL
3. 网络连接是否正常（OSM Overpass API）
