import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { useMutation } from "@tanstack/react-query";
import { Login } from "./components/Login";
import { BuddyList } from "./components/BuddyList";
import { ChatWindow } from "./components/ChatWindow";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  // Example Tauri command invocation using React Query
  const greetMutation = useMutation({
    mutationFn: (name: string) => invoke<{ message: string; status: string }>("greet", { name }),
    onSuccess: (data) => {
      console.log("Greeting response:", data);
    },
  });

  const handleLogin = (username: string, password: string) => {
    // In a real app, we would validate credentials here
    console.log("Login attempt with:", username, password);
    
    // Call our example Tauri command as a welcome message
    greetMutation.mutate(username);
    
    // Set logged in state
    setUsername(username);
    setIsLoggedIn(true);
  };

  const handleOpenChat = (contactId: number) => {
    setActiveChatId(contactId);
  };

  const handleCloseChat = () => {
    setActiveChatId(null);
  };

  // Render login screen if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <BuddyList username={username} onOpenChat={handleOpenChat} />
      
      {activeChatId !== null && (
        <ChatWindow contactId={activeChatId} onClose={handleCloseChat} />
      )}
    </div>
  );
}

export default App;