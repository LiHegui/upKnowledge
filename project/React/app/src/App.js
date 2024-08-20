import React from 'react';
import './App.css';
import Index from './views/index'
import { createContext } from 'react';
function App() {
  const ThemeContext = createContext(null);
  return (
    <>
      <ThemeContext.Provider value="dark">
        <Index></Index>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
