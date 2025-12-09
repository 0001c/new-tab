// The API key should live on the server. This module proxies requests to the local backend
// which holds the `GEMINI_API_KEY`. Do NOT store real keys in the browser.

type HistoryItem = { role: 'user' | 'model'; text: string };

export const askGemini = async (prompt: string): Promise<string> => {
  try {
    const res = await fetch('http://localhost:4000/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Gemini proxy error:', data);
      return "Sorry, I encountered an error connecting to the AI.";
    }
    return data.text || "I couldn't generate a response.";
  } catch (error) {
    console.error('Network error calling Gemini proxy:', error);
    return "Sorry, I encountered a network error.";
  }
};

export type ChatSession = {
  sendMessage: (opts: { message: string }) => Promise<{ text: string }>
  getHistory: () => HistoryItem[]
}

// Return a lightweight chat session object synchronously. The session keeps local history
// and `sendMessage` will POST the current history (including the new user message)
// to the backend `/api/gemini/chat` endpoint, then append the model reply to history.
export const startChat = (historyMap?: HistoryItem[]): ChatSession => {
  const history: HistoryItem[] = historyMap ? [...historyMap] : [];

  const sendMessage = async ({ message }: { message: string }) => {
    history.push({ role: 'user', text: message });

    try {
      const res = await fetch('http://localhost:4000/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Chat proxy error:', data);
        return { text: "Sorry, I couldn't reach the chat service." };
      }

      const text = (data && (data.text || (typeof data === 'string' ? data : null))) || JSON.stringify(data);
      history.push({ role: 'model', text });
      return { text };
    } catch (error) {
      console.error('Chat proxy error:', error);
      const fallback = "Sorry, something went wrong communicating with the chat service.";
      history.push({ role: 'model', text: fallback });
      return { text: fallback };
    }
  };

  return {
    sendMessage,
    getHistory: () => [...history]
  };
};