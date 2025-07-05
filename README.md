# NutritionTracker

A full-stack, AI-powered nutrition logging web app that lets you log meals in plain English, automatically parses nutrients via OpenAI, and keeps a persistent history with customizable daily/weekly goals.



## Features

- **Natural-language meal logging**  
  Just type “I had oatmeal and a banana” and our AI estimates calories, protein, carbs, fat (and any custom nutrients you choose).

- **Persistent history**  
  All entries are stored in a lightweight JSON database (`lowdb`) so your data survives server restarts.

- **Daily totals & trends**  
  Automatically aggregates meals by date, shows progress bars, interactive multi-line charts (Recharts), and editable tables.

- **Customizable nutrient goals**  
  Define your weekly targets for calories, protein, carbs, fat—or add your own like fiber, sodium, etc. Stored in `localStorage`.

- **4 AM cutoff logic**  
  Entries logged after midnight but before 4 AM count toward the previous day, perfect for late-night snacks.

- **Light & dark themes** via Material-UI (MUI) toggle.



## Tech Stack

- **Frontend**: React, MUI (Material-UI), Recharts, Axios  
- **Backend**: Node.js, Express, lowdb (JSON file), OpenAI Node SDK  
- **Persistence**: `db.json` via `lowdb` for meal entries; `localStorage` for goals  
- **Deployment**: Any Node-capable host (Heroku, Vercel, Railway) + static build for frontend

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+  
- An [OpenAI API key](https://platform.openai.com/account/api-keys)

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/YourUser/NutritionTracker.git
   cd NutritionTracker
