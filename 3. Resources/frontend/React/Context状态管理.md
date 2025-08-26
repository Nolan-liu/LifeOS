---
tags:
  - frontend/React
---

```Typescript
// ThemeContext.js
import React from 'react';
export const ThemeContext = React.createContext('light');

// App.jsx
import React, { useState } from 'react';
import { ThemeContext } from './ThemeContext';
import Toolbar from './Toolbar';

function App() {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

export default App;

// Toolbar.jsx
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function Toolbar() {
  const { theme, toggle } = useContext(ThemeContext);

  return (
    <div>
      <p>当前主题：{theme}</p>
      <button onClick={toggle}>切换主题</button>
    </div>
  );
}

export default Toolbar;

```