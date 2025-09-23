# Maplibre GL JS 安装指南

## 📦 安装信息

**Maplibre GL JS v5.7.3 已成功安装！**

### ✅ 安装详情
- **版本**: 5.7.3
- **许可证**: BSD 3-Clause License
- **开源免费**: 是
- **兼容性**: 兼容 Mapbox GL JS API

### 🔧 安装的文件
- ✅ `maplibre-gl` - 主库
- ✅ `@types/maplibre-gl` - TypeScript类型定义

## 🚀 使用方法

### 1. 基本导入
```typescript
import maplibregl from 'maplibre-gl';
```

### 2. 创建地图
```typescript
const map = new maplibregl.Map({
  container: 'map', // 容器ID
  style: 'https://demotiles.maplibre.org/style.json', // 样式URL
  center: [116.4074, 39.9042], // [经度, 纬度]
  zoom: 10
});
```

### 3. 添加控件
```typescript
// 导航控件
map.addControl(new maplibregl.NavigationControl(), 'top-right');

// 比例尺
map.addControl(new maplibregl.ScaleControl(), 'bottom-left');
```

## 🌍 访问演示页面

你可以访问以下路径查看Maplibre GL JS的演示：
- **英文**: `http://localhost:3000/maplibre-demo`
- **中文**: `http://localhost:3000/zh/maplibre-demo`

## 🎯 特性

- ✅ **2D/3D地图渲染** - 支持平面和立体地图显示
- ✅ **矢量瓦片支持** - 高性能的矢量数据渲染
- ✅ **开源免费** - 完全开源，无使用费用
- ✅ **BSD许可证** - 宽松的开源许可证
- ✅ **兼容Mapbox GL JS API** - 易于迁移现有代码

## 📚 相关资源

- **官方文档**: https://maplibre.org/maplibre-gl-js/docs/
- **GitHub仓库**: https://github.com/maplibre/maplibre-gl-js
- **演示样式**: https://demotiles.maplibre.org/style.json

## 🔄 项目配置

### package.json
```json
{
  "dependencies": {
    "maplibre-gl": "^5.7.3"
  },
  "devDependencies": {
    "@types/maplibre-gl": "^3.4.0"
  }
}
```

### TypeScript配置
tsconfig.json已配置支持Maplibre GL JS类型定义。

## 💡 开发建议

1. **使用组件化**: 将地图功能封装到React组件中
2. **多语言支持**: 使用i18n系统支持多语言界面
3. **性能优化**: 合理使用地图层级和数据源
4. **响应式设计**: 适配移动端和桌面端

## 🔧 故障排除

- **样式问题**: 确保正确导入CSS样式
- **类型错误**: 检查@types/maplibre-gl版本兼容性
- **加载问题**: 检查网络连接和样式URL可访问性

---

🎉 **Maplibre GL JS安装完成！** 现在你可以开始构建强大的地图应用了。
