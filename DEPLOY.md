# Deployment Guide for FYNANCE

## Overview
FYNANCE is a unified Python application (FastAPI) serving both the Backend API, the AI Engine, and the Static Frontend.

## Prerequisites
- Python 3.9+
- Google Gemini API Key

## Manual Deployment

1.  **Clone the Repository**
    ```bash
    git clone <repo-url>
    cd FYNANCE
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment**
    Ensure `.env` exists with your keys:
    ```env
    SECRET_KEY="your-production-secret"
    DATABASE_URL="sqlite:///./fynance.db"
    GEMINI_API_KEY="your-google-ai-key"
    ```

4.  **Run Server**
    ```bash
    python build.py
    ```

5.  **Access Application**
    - Web App: [http://localhost:8000](http://localhost:8000)
