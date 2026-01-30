import {
  ChatMessage,
  ChatSession,
  ChatResponse,
  ChatHistoryResponse,
} from "../types/chat";

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined");
}

console.log("frontend is calling ", API_BASE_URL);

export class ChatAPI {
  static async createSession(
    sessionName: string = "New Chat",
  ): Promise<ChatSession> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_name: sessionName }),
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    return response.json();
  }

  static async getSessions(): Promise<ChatSession[]> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions`);

    if (!response.ok) {
      throw new Error("Failed to fetch sessions");
    }

    return response.json();
  }

  static async getSessionHistory(
    sessionId: string,
  ): Promise<ChatHistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch session history");
    }

    return response.json();
  }

  static async sendMessage(
    content: string,
    sessionId?: string,
  ): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        session_id: sessionId || null,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete session");
    }
  }
}
