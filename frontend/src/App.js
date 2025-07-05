// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon  from '@mui/icons-material/DarkMode';
import { ColorModeContext } from './index';

import NutritionEntryForm from './NutritionEntryForm';
import HistoryPage         from './HistoryPage';
import GoalsPage           from './GoalsPage';

export default function App() {
  const theme     = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Nutrition Tracker
          </Typography>

          <Button color="inherit" component={Link} to="/goals">
            Goals
          </Button>
          <Button color="inherit" component={Link} to="/">
            Log Meal
          </Button>
          <Button color="inherit" component={Link} to="/history">
            History
          </Button>

          <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === 'dark'
              ? <LightModeIcon />
              : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Routes>
          <Route path="/goals"   element={<GoalsPage />} />
          <Route path="/"        element={<NutritionEntryForm />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Box>
    </Router>
  );
}
