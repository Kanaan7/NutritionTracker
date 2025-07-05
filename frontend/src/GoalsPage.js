// src/GoalsPage.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const STORAGE_KEY = 'nutrientGoals';
const DEFAULT_GOALS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', goal: 12500 },
  { key: 'protein',  label: 'Protein (g)', unit: 'g',   goal: 700   },
  { key: 'carbs',    label: 'Carbs (g)',   unit: 'g',   goal: 1750  },
  { key: 'fat',      label: 'Fat (g)',     unit: 'g',   goal: 500   }
];

// simple slugifier for labels → keys
function slugify(label) {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newGoal, setNewGoal] = useState('');

  // load from storage or defaults
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setGoals(saved ? JSON.parse(saved) : DEFAULT_GOALS);
  }, []);

  // persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const addNutrient = () => {
    if (!newLabel.trim() || !newGoal) return;
    setGoals([
      ...goals,
      {
        label: newLabel.trim(),
        key: slugify(newLabel),
        unit: '',
        goal: Number(newGoal)
      }
    ]);
    setNewLabel('');
    setNewGoal('');
  };

  const updateGoal = (idx, field, value) => {
    const copy = [...goals];
    if (field === 'label') {
      copy[idx].label = value;
      copy[idx].key = slugify(value);
    } else if (field === 'goal') {
      copy[idx].goal = Number(value);
    }
    setGoals(copy);
  };

  const removeNutrient = (idx) => {
    const copy = [...goals];
    copy.splice(idx, 1);
    setGoals(copy);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Your Nutrient Goals
        </Typography>

        {goals.map((g, i) => (
          <Box
            key={g.key}
            sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}
          >
            <TextField
              label="Name"
              value={g.label}
              fullWidth
              onChange={e => updateGoal(i, 'label', e.target.value)}
            />
            <TextField
              label="Goal"
              type="number"
              value={g.goal}
              onChange={e => updateGoal(i, 'goal', e.target.value)}
                sx={{
                minWidth: '100px',        // ensure at least 100px wide
                width: 'auto',            // allow to grow if number is longer
                  }}
                 InputProps={{
                     style: {
                         textAlign: 'center',    // center the number
                          },
                        }}
/>
            <IconButton onClick={() => removeNutrient(i)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Typography variant="subtitle1" gutterBottom>
          Add another nutrient
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Name"
            value={newLabel}
            fullWidth
            onChange={e => setNewLabel(e.target.value)}
          />
          <TextField
            label="Goal"
            type="number"
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
            sx={{
              minWidth: '100px',
              width: 'auto',
            }}
             InputProps={{
              style: {
               textAlign: 'center',
                 },
                }}
/>          
          <Button variant="contained" onClick={addNutrient}>
            Add
          </Button>
        </Box>

        <Button variant="outlined" fullWidth onClick={() => alert('Goals saved!')}>
          Save Goals
        </Button>
      </Paper>
    </Container>
  );
}
