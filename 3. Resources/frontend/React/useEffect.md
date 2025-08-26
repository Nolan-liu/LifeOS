---
tags:
  - frontend/React
---

---

## 1. `useEffect` 是什么？

- `useEffect` 是一个 **副作用（side effect）管理 Hook**。
    
- 它可以让你在函数组件中执行 **副作用逻辑**，而不需要 class 组件的生命周期函数（`componentDidMount`、`componentDidUpdate`、`componentWillUnmount`）。
    
- 官方定义：在组件渲染后运行副作用。
    

导入方式：

```js
import { useEffect } from "react";
```

---

## 2. 副作用（side effect）是什么？

在 React 中，渲染 UI 是 **纯计算**（根据 state → UI），但是一些操作并不是纯渲染，比如：

- 网络请求（fetch API 数据）
    
- 订阅/监听（事件、WebSocket）
    
- DOM 操作（手动操作元素、动画）
    
- 定时器（setTimeout、setInterval）
    
- 日志打印 / 本地存储操作
    

这些行为就叫 **副作用（effects）**。  
`useEffect` 就是 React 提供的副作用管理机制。

---

## 3. `useEffect` 的基本语法

```jsx
useEffect(() => {
  // 副作用逻辑
  return () => {
    // 可选：清理逻辑（组件卸载或依赖变化时执行）
  };
}, [依赖数组]);
```

参数说明：

1. **第一个参数**：回调函数，定义副作用逻辑。
    
2. **返回值（可选）**：清理函数（类似 `componentWillUnmount`）。
    
3. **第二个参数（依赖数组）**：决定副作用执行时机。
    

---

## 4. 三种常见用法

### 4.1 不加依赖数组 → 每次渲染后都会执行

```jsx
useEffect(() => {
  console.log("组件渲染或更新时执行");
});
```

相当于 `componentDidMount + componentDidUpdate`。

---

### 4.2 空依赖数组 → 只在首次渲染执行

```jsx
useEffect(() => {
  console.log("仅首次渲染执行（Mount）");

  return () => {
    console.log("组件卸载时执行");
  };
}, []);
```

相当于 `componentDidMount` 和 `componentWillUnmount`。

---

### 4.3 依赖特定变量 → 在变量变化时执行

```jsx
useEffect(() => {
  console.log("count 变化时执行");
}, [count]);
```

只会在 `count` 更新时运行副作用。

---

## 5. 常见应用场景

1. **数据请求**
    
    ```jsx
    useEffect(() => {
      fetch("/api/data")
        .then(res => res.json())
        .then(data => setData(data));
    }, []);
    ```
    
    组件挂载时发起请求。
    
2. **事件监听 & 清理**
    
    ```jsx
    useEffect(() => {
      const handleResize = () => console.log(window.innerWidth);
      window.addEventListener("resize", handleResize);
    
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);
    ```
    
3. **定时器**
    
    ```jsx
    useEffect(() => {
      const timer = setInterval(() => {
        console.log("tick");
      }, 1000);
    
      return () => clearInterval(timer);
    }, []);
    ```
    
4. **与外部系统交互（WebSocket、地图 API、动画库等）**
    

---

## 6. 注意事项 ⚠️

- **避免死循环**：如果副作用里更新了依赖数组里的变量，会导致无限循环。
    
- **依赖数组要写全**：React 官方建议用 ESLint 插件自动检查依赖，避免遗漏。
    
- **清理函数很重要**：订阅/定时器/资源占用等，一定要在清理函数里释放。
    

---

✅ **一句话总结：**  
`useEffect` 用来在函数组件中处理副作用逻辑，可以看作是 React 提供的 **生命周期函数替代品**，常用于 **数据请求、事件订阅、DOM 操作、定时器** 等场景。

---

要不要我帮你画一张图，把 `useEffect` 和 class 组件生命周期 (`componentDidMount` / `componentDidUpdate` / `componentWillUnmount`) 对照起来，更直观？