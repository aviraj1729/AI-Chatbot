import { useState, useEffect } from "react";
import { ChatContainer } from "./components/ChatContainer";
import { Sidebar } from "./components/Sidebar";
import { ChatSession } from "./types/chat";
import { ChatAPI } from "./services/api";
import { useDarkMode } from "./hooks/useDarkMode";

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isDark, setIsDark] = useDarkMode();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const fetchedSessions = await ChatAPI.getSessions();
      setSessions(fetchedSessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
  };

  const handleSessionCreated = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    loadSessions();
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await ChatAPI.deleteSession(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      loadSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  return (
    // CHANGE: Use 'fixed inset-0' instead of 'h-dvh' to strictly lock the layout
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />
      <ChatContainer
        sessionId={currentSessionId}
        onSessionCreated={handleSessionCreated}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
      />
    </div>
  );
}

export default App;
