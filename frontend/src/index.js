// src/index.js
import React, { useState, useMemo, createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function Main() {
  const storedMode = localStorage.getItem('themeMode') || 'light';
  const [mode, setMode] = useState(storedMode);

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode(prev => {
        const next = prev === 'light' ? 'dark' : 'light';
        localStorage.setItem('themeMode', next);
        return next;
      });
    },
  }), []);

  const theme = useMemo(() => createTheme({
    palette: { mode },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
