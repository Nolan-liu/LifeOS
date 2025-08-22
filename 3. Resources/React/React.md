
## **state如同一张快照，具有异步、批处理特性**
### **1. 异步（Asynchronous）**

- 在 React 中，`setState`（`useState` 的 `setScore` 也是）**不会立刻更新状态变量**。
    
- 状态更新会被放到 React 的“更新队列”里，等当前事件处理完成后才统一执行。
    
- 这意味着**同一渲染周期内读取到的 `score` 是旧值**，即使你已经调用了好几次 `setScore(score + 1)`。
    

---

### **2. 批处理（Batching）**

- React 会**合并同一事件循环中的多个状态更新**，以减少重复渲染次数。
    
- 如果多次调用 `setScore(score + 1)` 且依赖的是**同一个旧值**，React 会优化成一次更新（只加 1）。
    
- 这种批处理优化在 React 18 后，默认不仅限于事件处理函数，还会在异步任务（如 `setTimeout`、`Promise`）中生效。
    

---

### **3. 为什么两者一起导致 +3 失败**

- **异步**：三次 `increment()` 用的都是渲染时的旧值 `score`（比如 0）。
    
- **批处理**：React 将三次 `setScore(0 + 1)` 合并成一次更新，最终加 1。
    

---

### **4. 如何绕过这个限制**

用**函数式更新**：

```js
setScore(prev => prev + 1);
```

- 这样 `prev` 会在每次执行时获取到最新的状态值，三次调用就能真正累加成 +3。
    
- 即使在批处理模式下也能得到正确结果。
    

---
---

## **状态不可变性（immutability）原则**

---

## **1. 状态可以是任何类型**

React 中 `useState` 或 `this.state` 里存的值可以是：

- 基本类型：`number`, `string`, `boolean`
    
- 引用类型：`object`, `array`, `Map`, `Set` 等
    
- 甚至是 `null`、`undefined`
    

例如：

```js
const [user, setUser] = useState({ name: 'Alice', age: 25 });
```

这里 `user` 就是一个对象。

---

## **2. 为什么不能直接修改对象或数组**

在 JavaScript 中，对象和数组是**引用类型**，如果直接修改它们的属性或元素：

```js
user.age = 26; // ❌ 直接改对象属性
```

- 引用地址没有变
    
- React 比较新旧状态时，发现地址一样，就认为状态没变  
    → 不会触发重新渲染
    

**结果**：UI 不会更新，或者出现难以排查的 bug。

---

## **3. 正确做法：创建副本再更新**

我们需要用一个**新对象**替代旧对象，这样引用地址改变，React 才会检测到状态变化。

常用方法：

- **对象**：使用 **展开运算符** `...` 复制属性
    
- **数组**：用 `...`、`map()`、`filter()`、`concat()` 等创建新数组
    

---

### **更新嵌套对象的例子**

假设 `user` 里有个嵌套的 `address`：

```js
const [user, setUser] = useState({
  name: 'Alice',
  address: { city: 'Beijing', zip: '100000' }
});
```

**错误做法（直接改）**：

```js
user.address.city = 'Shanghai'; // ❌
setUser(user);
```

**正确做法（复制外层 & 内层对象）**：

```js
setUser({
  ...user, // 复制外层对象
  address: {
    ...user.address, // 复制内层对象
    city: 'Shanghai' // 更新属性
  }
});
```

这样：

- `setUser` 收到的是一个**全新引用**的对象
    
- React 会触发重新渲染
    

---

## **4. 核心原则**

- 不直接修改原状态
    
- 始终返回一个**新对象/新数组**
    
- 尽量用展开语法 `...` 或不可变操作的数组方法
    

---
---

# useReducer工作流程图

没问题，我用文字帮你画一个清晰的 **useReducer 工作流程图**，用 ASCII 流程来表示：

```
       ┌───────────┐
       │    UI     │
       └─────┬─────┘
             │  用户操作（点击、输入等）
             ▼
      ┌─────────────┐
      │ dispatch()  │
      └─────┬───────┘
            │ 传入 action 对象 { type, payload }
            ▼
      ┌─────────────┐
      │   reducer   │
      │ (state,action) => newState
      └─────┬───────┘
            │ 根据旧 state + action 生成新 state
            ▼
      ┌─────────────┐
      │   新 state  │
      └─────┬───────┘
            │ 更新触发 React 渲染
            ▼
       ┌───────────┐
       │    UI     │
       └───────────┘
```

这个流程核心就是：

1. **UI 触发 dispatch(action)**
    
2. **reducer 根据当前 state 和 action 返回新 state**
    
3. **React 更新 UI**
    

