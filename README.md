# FYNANCE

<div align="center">
  <h3>VisionOS Inspired Personal Finance & AI Agent</h3>
  <p>A next-generation finance tracker combining 3D glassmorphism UI with a proactive AI financial coach.</p>
</div>

---

## 🚀 Overview

**FYNANCE** is a personal finance application designed to feel like a spatial operating system. It moves beyond simple spreadsheets by integrating **Behavioral Analytics** and **AI Interventions**.

At its core is **Fin**, an AI agent powered by Google Gemini (via LangChain) that doesn't just answer questions—it analyzes your spending patterns, detects impulsive behavior, and intervenes with "micro-lessons" to help you build wealth.

## ✨ Key Features

- **💎 VisionOS UI**: A stunning, depth-based interface with glassmorphism, floating navigational elements, and ambient lighting.
- **🤖 AI Financial Coach ("Fin")**:
  - **Chat**: A fully contextual chatbot that knows your financial history and goals.
  - **Intervention Engine**: Detects high-risk spending (e.g., late-night shopping) and nudges you before you buy.
  - **Simulation**: Projects your financial future 6 months out based on current habits vs. optimized habits.
- **📊 Core Financials**:
  - **Spending Tracker**: Log transactions with categories and dates.
  - **Subscription Manager**: Track recurring costs and see the total monthly drain.
  - **Goal Setting**: Set visual savings targets.
- **🧠 Mood & Behavior**:
  - **Mood Logger**: Track how you feel when you spend to identify emotional spending triggers.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Variables, Grid, Glassmorphism). No frameworks, just pure performance.
- **Backend**: Python **FastAPI** (High performance, async).
- **AI Engine**: 
  - **LangChain**: For agentic workflows and chain management.
  - **Google Gemini Pro**: For reasoning and generation.
  - **ChromaDB** (Planned): For RAG (Retrieval Augmented Generation).
- **Database**: SQLite (Simple, file-based persistence).

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- A Google AI Studio API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Harsidak/FYnance.git
    cd FYnance
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment**
    
    You need a Google API Key for the AI brain to work.
    
    1.  **Get a Key**: Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a new API key.
    2.  **Create Config File**:
        - Navigate to the `ai_engine/` folder.
        - Create a new file named `.env`.
        - Paste your key inside like this:
        ```ini
        GEMINI_API_KEY=your_actual_api_key_starts_with_AIza...
        ```
    > **Note**: Do not put the `.env` file in the root folder; it belongs inside `ai_engine/`.

4.  **Run the System**
    We have a unified build script that launches both the backend and the AI engine.
    ```bash
    python build.py
    ```

5.  **Access the App**
    Open your browser and navigate to: `http://localhost:8000`

## 📂 Project Structure

```
FYNANCE/
├── ai_engine/           # The brain of the operation
│   ├── modules/         # Chat, Intervention, Prediction logic
│   └── main.py          # AI Microservice (Port 8001)
├── server/              # Main Application Backend
│   ├── routers/         # API Endpoints (Spending, Goals, Proxy to AI)
│   ├── static/          # Frontend Assets (Glass UI, JS Modules)
│   └── main.py          # Web Server (Port 8000)
├── build.py             # Unified launcher script
└── requirements.txt     # Backend dependencies
```

## 🤝 Contributing
We welcome contributions! Please see [CONTRIBUTION.md](./CONTRIBUTION.md) for our roadmap, known bugs, and research context.

## 🔒 Security Note
- **API Keys**: Never commit your `.env` file. It is included in `.gitignore`.
- **Data**: All data is stored locally in `fynance.db`.

---

<div align="center">
  <sub>Built with bad financial decisions, so you don't have to make them.</sub>
</div>
