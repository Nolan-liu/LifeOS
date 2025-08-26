好的，我帮你做一张 **Vue → Next.js 技能迁移速查表**，让你能用 Vue 的思维快速上手 React + Next.js。

---

## 🗺 Vue → Next.js 技能迁移速查表

| Vue / Nuxt 概念                            | React / Next.js 对应                             | 说明与差异                                                                      |
| ---------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| **模板语法** `<template>` + Mustache `{{ }}` | **JSX** `{ }`                                  | JSX 是 JS 语法扩展，不需要单独模板文件，直接在 JS/TS 里写 HTML 结构，动态数据用 `{}` 包裹。                |
| **组件注册** `components: {}` 或自动导入          | 直接 `import` 再用 `<Component />`                 | React 组件必须显式 `import`（可用工具做自动导入）。                                          |
| **数据** `data()`                          | `useState()`                                   | React 没有 `data`，用 Hook 管理状态，如 `const [count, setCount] = useState(0)`。     |
| **方法** `methods: {}`                     | 普通函数 + 直接定义在组件内                                | 在 React 中直接在组件函数里写逻辑函数，不需要单独 `methods`。                                    |
| **计算属性** `computed`                      | `useMemo()` 或直接计算                              | 简单计算直接写在 JSX 或变量里，性能优化用 `useMemo`。                                         |
| **生命周期** `mounted`, `beforeUnmount`      | `useEffect()`                                  | `useEffect(() => { ... }, [])` 相当于 `mounted`，返回函数可做清理，相当于 `beforeUnmount`。 |
| **父子通信** `props`                         | `props`                                        | 基本相同，但 React `props` 是函数参数，不是 `this.props`（除类组件）。                          |
| **子传父** `$emit`                          | 回调函数 props                                     | 直接将函数传给子组件，子组件调用触发。                                                        |
| **双向绑定** `v-model`                       | `value` + `onChange`                           | React 无直接 `v-model`，表单输入需手动绑定值与事件。                                         |
| **条件渲染** `v-if`                          | `{ condition && <div>...</div> }`              | 逻辑用 `&&` 或三元运算符。                                                           |
| **列表渲染** `v-for`                         | `{array.map(item => ...)}`                     | 用 `map` 生成 JSX 元素，记得加 `key`。                                               |
| **样式绑定** `:class`                        | `className`                                    | 支持字符串、模板字符串、对象（借助 `clsx` 等库）。                                              |
| **路由** `pages/` + `vue-router`           | `pages/` + Next.js 文件路由                        | 文件夹结构自动生成路由，支持动态路由 `[id].js`。                                              |
| **服务端渲染** Nuxt `asyncData`, `fetch`      | Next.js `getServerSideProps`, `getStaticProps` | 用函数在构建/请求时获取数据，支持 ISR（增量静态生成）。                                             |
| **API 路由** Nuxt `server/api/*.ts`        | Next.js `pages/api/*.ts` 或 `app/api`           | 可直接写 API 处理函数，部署在 Vercel 时自动 Serverless。                                   |
| **状态管理** Vuex / Pinia                    | Redux, Zustand, Jotai, Context API             | React 官方没有强制方案，小项目可用 `useState`/`useReducer`，大项目用 Zustand 等轻量库。            |

---

## 🚀 学习建议（最快上手法）

1. **先学 React 基础语法**（JSX + Hooks）
    
    - 你已经会组件化思想，只需要适应 JSX 和 `useState`、`useEffect`。
        
2. **直接从 Next.js App Router 开始**（别学老的 Pages Router）
    
    - 用 `app/` 目录的最新写法，学习一遍路由、数据获取、API routes。
        
3. **用 Tailwind + shadcn/ui** 搭 UI
    
    - 避免自己手写大量 CSS，能快速有成品级外观。
        
4. **实战一个 AI 项目**
    
    - 比如“文档问答”或“聊天机器人”，你能一边用 Python 提供 AI API，一边用 Next.js 展示。
        

---
