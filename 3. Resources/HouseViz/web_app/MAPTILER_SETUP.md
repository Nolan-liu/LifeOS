# Maptiler GL JS + Maplibre 配置指南

## 📋 配置步骤

### 1. 获取Maptiler API Key

1. 访问 [Maptiler Cloud](https://cloud.maptiler.com/account/keys/)
2. 注册/登录您的账户
3. 创建新的API Key
4. 复制API Key

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件（此文件已被.gitignore忽略，不会提交到版本控制）：

**Windows:**
```bash
# 1. 打开记事本或任何文本编辑器
# 2. 输入以下内容：
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptile_api_key_here

# 3. 保存为 .env.local 文件在项目根目录中
```

**macOS/Linux:**
```bash
# 在终端中运行：
echo "NEXT_PUBLIC_MAPTILER_API_KEY=your_maptile_api_key_here" > .env.local
```

**替换说明：**
- 将 `your_maptile_api_key_here` 替换为您的实际Maptiler API Key
- 确保 `.env.local` 文件在项目根目录中（与package.json同级）

**验证配置：**
```bash
# 检查文件是否创建成功
ls -la .env.local
# 或在Windows中：
dir .env.local
```

### 3. 验证配置

创建 `.env.local` 文件后，环境变量 `NEXT_PUBLIC_MAPTILER_API_KEY` 将在客户端和服务端都可用。

## 🗺️ 使用说明

### 基本用法

```typescript
import SimpleMap from "@/components/maplibre/simple-map";

// 在您的React组件中使用
<SimpleMap
  width="100%"
  height="400px"
  center={[116.4074, 39.9042]} // 北京坐标
  zoom={10}
/>
```

### 自定义配置

```typescript
<SimpleMap
  width="800px"
  height="600px"
  center={[121.4737, 31.2304]} // 上海坐标
  zoom={12}
/>
```

### 样式选择器

```typescript
import StyleSelector from "@/components/maplibre/style-selector";

// 在您的组件中使用
<StyleSelector onStyleChange={(styleUrl) => {
  // 处理样式变化
  console.log('新样式:', styleUrl);
}} />
```

### 城市坐标

```typescript
// 中国主要城市坐标
const cities = {
  beijing: [116.4074, 39.9042],
  shanghai: [121.4737, 31.2304],
  guangzhou: [113.2644, 23.1291],
  shenzhen: [114.0579, 22.5431],
  hangzhou: [120.1536, 30.2875],
  nanjing: [118.7969, 32.0603]
};
```

## 🎨 Maptiler 样式选项

Maptiler 提供多种地图样式，您可以在 Maptiler Cloud 控制台中查看：

- **streets-v2** (默认) - 街道地图样式
- **satellite** - 卫星图像
- **terrain** - 地形图
- **winter** - 冬季主题
- **basic-v2** - 基础地图
- **bright-v2** - 明亮主题
- **pastel-v2** - 柔和色彩
- **toner-v2** - 黑白风格

## 🔧 修改地图样式

要使用不同的Maptiler样式，请修改 `components/maplibre/simple-map.tsx` 文件：

```typescript
// 使用卫星样式
const styleUrl = maptilerApiKey
  ? `https://api.maptiler.com/maps/satellite/style.json?key=${maptilerApiKey}`
  : 'https://demotiles.maplibre.org/style.json';

// 使用地形样式
const styleUrl = maptilerApiKey
  ? `https://api.maptiler.com/maps/terrain/style.json?key=${maptilerApiKey}`
  : 'https://demotiles.maplibre.org/style.json';
```

## 📍 坐标系统

- **纬度 (Latitude)**: -90 到 90 (北纬为正，南纬为负)
- **经度 (Longitude)**: -180 到 180 (东经为正，西经为负)

### 中国主要城市坐标：
- 北京: [116.4074, 39.9042]
- 上海: [121.4737, 31.2304]
- 广州: [113.2644, 23.1291]
- 深圳: [114.0579, 22.5431]

## 🚀 访问演示

配置完成后，您可以访问以下路径查看Maplibre GL JS + Maptiler的演示：

- **英文**: `http://localhost:3000/maplibre`
- **中文**: `http://localhost:3000/zh/maplibre`

## ⚠️ 注意事项

1. **API Key 安全**: 不要将API Key提交到版本控制系统
2. **配额限制**: Maptiler有免费配额限制，超出后需要付费
3. **网络连接**: 确保您的服务器可以访问Maptiler API
4. **HTTPS**: 生产环境建议使用HTTPS

## 🔍 故障排除

#### 常见错误及解决方案：

### 1. "INVALID_MESSAGE: MALFORMED_ARGUMENT" 错误
**原因**: 代码示例中的引号或语法问题

**解决方案**:
- ✅ 检查JSON文件中的代码示例是否正确转义
- ✅ 确保container ID在HTML和代码示例中一致
- ✅ 验证Maplibre GL JS版本兼容性

### 2. 地图无法加载
**检查步骤**:
1. 打开浏览器开发者工具 (F12)
2. 检查 Console 标签页的错误信息
3. 验证 `.env.local` 文件是否存在且格式正确
4. 确认API Key是否有效且未过期
5. 检查网络连接是否正常

### 3. 显示回退样式（演示样式）
**原因**: Maptiler API Key未配置或无效

**解决方案**:
- 检查 `.env.local` 文件中的 `NEXT_PUBLIC_MAPTILER_API_KEY`
- 确认API Key从Maptiler Cloud复制正确
- 查看浏览器控制台的警告信息
- 确认Maptiler服务是否可访问

### 4. TypeScript类型错误
**解决方案**:
- 确保已安装 `@types/maplibre-gl`
- 检查tsconfig.json配置
- 重启TypeScript语言服务器

### 5. 容器ID问题
**当前实现**: 使用 `maplibre-container` 作为容器ID
**代码示例**: 也使用 `maplibre-container` 保持一致

### 6. 调试工具
访问 `/maplibre` 页面查看测试组件状态：
- 绿色状态：Maplibre GL JS正常工作
- 红色状态：存在配置或加载问题

---

🎉 **配置完成！** 现在您可以使用Maplibre GL JS + Maptiler渲染高质量的地图了！
