# Quick Start Guide

Get your AI Chatbot running in minutes!

## Prerequisites Check

Ensure you have:
- ✅ Python 3.10+ installed: `python --version`
- ✅ Node.js 18+ installed: `node --version`

## 5-Minute Setup

### Terminal 1: Start Backend (FastAPI)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment (first time only)
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```

**Backend running at:** http://localhost:8000

### Terminal 2: Start Frontend (React)

```bash
# In project root directory
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend running at:** http://localhost:5173

## Verify Setup

1. ✅ Backend API docs: http://localhost:8000/docs
2. ✅ Frontend app: http://localhost:5173
3. ✅ Send a test message in the chat interface

## Common Issues

### Backend Issues

**ImportError: No module named 'fastapi'**
- Solution: Make sure virtual environment is activated and dependencies are installed
```bash
pip install -r requirements.txt
```

**Database connection errors**
- Solution: Check that SUPABASE_URL and SUPABASE_ANON_KEY are set in backend/.env

### Frontend Issues

**Port already in use**
- Solution: Stop the process using port 5173 or Vite will automatically use a different port

**API connection failed**
- Solution: Ensure backend is running on http://localhost:8000

## Next Steps

- 🎨 Customize the UI colors in component files
- 🤖 Replace mock AI with OpenAI API (see README.md)
- 🚀 Deploy to production (see README.md)

## Stop Servers

- Press `Ctrl+C` in both terminal windows
- Deactivate Python virtual environment: `deactivate`

---

**Need help?** Check the full README.md for detailed documentation.
