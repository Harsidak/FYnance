# Contributing to FYNANCE

First off, thanks for taking the time to contribute! 🎉

FYNANCE is an experimental project combining high-fidelity UI design with agentic AI. We welcome contributions that push the boundaries of what a personal finance app can be.

## 📚 Context & Research

Before diving into features, we highly recommend reading the **[Financial App Research and Strategy (AI generated).pdf](./Financial%20App%20Research%20and%20Strategy%20(AI%20generated).pdf)** included in this repository.

This document covers the core philosophy behind the app:
- **Behavioral Economics**: Why we value "Nudges" over simple charts.
- **Micro-Interventions**: The concept of interrupting impulsive spending moments.
- **Gamification**: How to make saving dopamine-inducing.

## 🐛 Known Bugs

If you're looking for something to fix, here are our current pain points:

1.  **Mobile Responsiveness**: The "Glassmorphism" UI (`style.css`) is optimized for desktop/tablet. It needs significant tuning for mobile screens (media queries for `.glass-nav` and `.nav-content`).
2.  **AI Latency**: The "Fin" chatbot can sometimes take 10-15 seconds to reply. We need to implement streaming responses in the `chat.py` and frontend to make it feel faster.
3.  **Chart Re-rendering**: The simulation charts in `pages/ai.js` sometimes don't clear properly when re-running a simulation without refreshing.

## 🌟 Feature Roadmap

We have ambitious plans. Here are features we want to build next:

### 1. RAG (Retrieval Augmented Generation) 🧠
- **Status**: Skeleton code exists in `ai_engine/modules/knowledge.py`.
- **Goal**: Implement ChromaDB to index financial news/tips so "Fin" can give real-time market advice, not just general tips.

### 2. Voice Mode 🎙️
- **Status**: Not started.
- **Goal**: Add a "Talk to Fin" button using the browser's WebSpeech API. Users should be able to say "I just spent $50 on sushi" and have it logged automatically.

### 3. "Impulse Jail" V2 🔒
- **Status**: Concept only.
- **Goal**: Create a browser extension that communicates with this local server. If you visit a shopping site, it checks your `Intervention` risk score and blocks the page if you're over budget.

## 🤝 How to Contribute

1.  **Fork the repo** and create your branch from `main`.
2.  **Install dependencies** (`pip install -r requirements.txt`).
3.  **Run the build script** (`python build.py`) to confirm everything works.
4.  **Make your changes**.
5.  **Test**:
    - Verify backend APIs via Swagger (`http://localhost:8000/docs`).
    - Verify UI interactions.
6.  **Submit a Pull Request** with a screenshot/video of your changes.

---

<div align="center">
  <sub>"Compound interest is the eighth wonder of the world." — Einstein (probably)</sub>
</div>
