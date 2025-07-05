// src/NutritionEntryForm.js
import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material';
import axios from 'axios';

export default function NutritionEntryForm() {
  const [entry, setEntry] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // include dynamic nutrient keys
      const goals = JSON.parse(localStorage.getItem('nutrientGoals') || '[]');
      const keys  = goals.map(g => g.key);
      const { data } = await axios.post('/api/nutrition', {
        text:      entry,
        nutrients: keys
      });
      setResult(data);
      setEntry('');
    } catch (err) {
      console.error(err.response || err);
      const msg = err.response?.data?.error || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card elevation={3} sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Log a Meal
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="What did you eat?"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Logging…' : 'Log'}
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {result && (
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Last Entry
                </Typography>
                <List>
                  <ListItem disablePadding>
                    <ListItemText primary="Date" secondary={result.date} />
                  </ListItem>
                  {Object.entries(result).map(([k, v]) => {
                    if (['date', 'tips', 'id'].includes(k)) return null;
                    const label = k.charAt(0).toUpperCase() + k.slice(1);
                    return (
                      <ListItem disablePadding key={k}>
                        <ListItemText primary={label} secondary={v} />
                      </ListItem>
                    );
                  })}
                </List>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {result.tips}
                </Typography>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
