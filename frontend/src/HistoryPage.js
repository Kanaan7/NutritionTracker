// src/HistoryPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [dailyTotals, setDailyTotals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load and aggregate history
  useEffect(() => {
    setLoading(true);
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setEntries(data);

        // Aggregate per-day totals
        const agg = data.reduce((acc, item) => {
          const { date, ...nutrients } = item;
          if (!acc[date]) {
            acc[date] = { date, ...nutrients };
          } else {
            Object.entries(nutrients).forEach(([key, value]) => {
              if (key !== 'id') {
                acc[date][key] = (acc[date][key] || 0) + (value || 0);
              }
            });
          }
          return acc;
        }, {});

        // Convert to sorted array by date
        const dailyArr = Object.values(agg).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setDailyTotals(dailyArr);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load history.');
        setLoading(false);
      });
  }, []);

  // Get nutrient goals
  const goals = JSON.parse(localStorage.getItem('nutrientGoals') || '[]');

  // Calculate weekly totals from dailyTotals
  const weeklyTotals = goals.reduce((sumObj, g) => {
    sumObj[g.key] = dailyTotals.reduce(
      (sum, day) => sum + (day[g.key] || 0),
      0
    );
    return sumObj;
  }, {});

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  if (!dailyTotals.length) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>No entries yet. Log a meal to get started!</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        History (Daily Totals)
      </Typography>

      {/* Weekly progress bars */}
      {goals.map((g, i) => {
        const total = weeklyTotals[g.key] || 0;
        const pct = Math.min((total / g.goal) * 100, 100);
        return (
          <Box key={g.key} sx={{ mb: 2 }}>
            <Typography gutterBottom>
              Weekly {g.label} Progress ({total}/{g.goal} {g.unit})
            </Typography>
            <LinearProgress variant="determinate" value={pct} />
          </Box>
        );
      })}

      {/* Daily trend chart */}
      <Typography variant="subtitle1" gutterBottom>
        Trends (Daily)
      </Typography>
      <Box sx={{ width: '100%', height: 300, mb: 4 }}>
        <ResponsiveContainer>
          <LineChart data={dailyTotals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            {goals.map((g, i) => (
              <Line
                key={g.key}
                type="monotone"
                dataKey={g.key}
                stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff8042'][i % 4]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Daily totals table */}
      <Typography variant="subtitle1" gutterBottom>
        Daily Totals
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            {goals.map(g => (
              <TableCell key={g.key}>{g.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dailyTotals.map(day => (
            <TableRow key={day.date}>
              <TableCell>{day.date}</TableCell>
              {goals.map(g => (
                <TableCell key={g.key}>{day[g.key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
