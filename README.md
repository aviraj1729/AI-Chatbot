# AI Chatbot - Full Stack Application

A production-ready full-stack chatbot application built with FastAPI (backend) and React (frontend). Features a beautiful, responsive UI with dark mode support and persistent chat history.

## Features

- **Real-time Chat Interface**: Beautiful, responsive chat UI with smooth animations
- **Persistent Chat History**: All conversations are stored in Supabase database
- **Multiple Sessions**: Create and manage multiple chat sessions
- **Dark Mode**: Toggle between light and dark themes
- **Typing Indicators**: Visual feedback when the bot is responding
- **Session Management**: View, switch between, and delete chat sessions
- **RESTful API**: Well-structured FastAPI backend with proper error handling
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Supabase**: PostgreSQL database for data persistence
- **Pydantic**: Data validation and settings management
- **Python 3.10+**: Latest Python features

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool and dev server
- **Lucide React**: Beautiful icons

## Project Structure

```
project/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables
│   ├── routers/
│   │   └── chat.py            # Chat API endpoints
│   ├── schemas/
│   │   └── chat.py            # Pydantic models
│   └── services/
│       ├── ai_service.py      # AI response generation
│       └── database.py        # Database operations
└── src/
    ├── App.tsx                # Main React component
    ├── components/
    │   ├── ChatContainer.tsx  # Main chat interface
    │   ├── ChatMessage.tsx    # Individual message component
    │   ├── ChatInput.tsx      # Message input field
    │   ├── TypingIndicator.tsx # Typing animation
    │   └── Sidebar.tsx        # Session management sidebar
    ├── services/
    │   └── api.ts             # API client
    ├── hooks/
    │   └── useDarkMode.ts     # Dark mode hook
    └── types/
        └── chat.ts            # TypeScript types
```

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn
- Supabase account (database is already set up)

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Environment variables are already configured in .env
# Start the backend server
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

#### Chat Endpoints

- `POST /api/chat/sessions` - Create a new chat session
- `GET /api/chat/sessions` - Get all chat sessions
- `GET /api/chat/sessions/{session_id}` - Get session with message history
- `POST /api/chat/message` - Send a message and get AI response
- `DELETE /api/chat/sessions/{session_id}` - Delete a chat session

#### Health Check

- `GET /` - API information
- `GET /health` - Health check endpoint

## Usage

1. **Start a New Chat**: Click the "New Chat" button in the sidebar
2. **Send Messages**: Type your message and press Enter or click the send button
3. **Switch Sessions**: Click on any previous chat in the sidebar to continue
4. **Delete Sessions**: Hover over a session and click the trash icon to delete
5. **Toggle Dark Mode**: Click the moon/sun icon in the header

## Database Schema

The application uses two main tables:

### chat_sessions
- `id` (uuid): Session identifier
- `user_id` (uuid): Optional user identifier
- `session_name` (text): Display name for the session
- `created_at` (timestamp): Creation time
- `updated_at` (timestamp): Last update time

### chat_messages
- `id` (uuid): Message identifier
- `session_id` (uuid): Foreign key to chat_sessions
- `role` (text): Either 'user' or 'assistant'
- `content` (text): Message content
- `created_at` (timestamp): Creation time

## Customization

### Adding OpenAI Integration

Replace the mock AI service with OpenAI:

1. Install OpenAI SDK:
```bash
cd backend
pip install openai
```

2. Add API key to `.env`:
```
OPENAI_API_KEY=your_key_here
```

3. Update `backend/services/ai_service.py` to use OpenAI API

### Styling

- Modify `tailwind.config.js` for theme customization
- Update component styles in respective `.tsx` files
- Customize colors, fonts, and spacing in the Tailwind classes

## Production Deployment

### Backend

1. Set up environment variables in production
2. Use a production WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend

1. Build the production bundle:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

3. Update the API_BASE_URL in `src/services/api.ts` to your production backend URL

## Development

### Run Tests

```bash
# Backend tests (if implemented)
cd backend
pytest

# Frontend tests (if implemented)
npm run test
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Features Roadmap

- [ ] User authentication
- [ ] Message editing and deletion
- [ ] File attachments
- [ ] Code syntax highlighting
- [ ] Voice input
- [ ] Export chat history
- [ ] Real-time streaming responses
- [ ] Multi-language support

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the repository.
