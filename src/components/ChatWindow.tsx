import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: number;
  content: string;
  is_from_user: boolean;
  timestamp: string;
}

interface Contact {
  id: number;
  name: string;
  status: string;
  category: string;
}

interface ChatWindowProps {
  contactId: number;
  onClose: () => void;
}

export function ChatWindow({ contactId, onClose }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight / 2 - 300,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Query to fetch contact details
  const { data: contact } = useQuery({
    queryKey: ["contact", contactId],
    queryFn: async () => {
      try {
        // This would normally fetch from the Tauri backend
        // return await invoke<Contact>("get_contact", { contactId });
        
        // For demonstration, return mock data
        const mockContacts = [
          { id: 1, name: "Claude AI", status: "online", category: "AI Agents" },
          { id: 2, name: "GPT-4", status: "online", category: "AI Agents" },
          { id: 3, name: "Anthropic", status: "away", category: "AI Agents" },
          { id: 4, name: "Sarah", status: "online", category: "Buddies" },
          { id: 5, name: "Mike", status: "offline", category: "Buddies" },
          { id: 6, name: "Jessica", status: "away", category: "Co-Workers" },
          { id: 7, name: "Dad", status: "offline", category: "Family" },
        ];
        
        return mockContacts.find(c => c.id === contactId) as Contact;
      } catch (e) {
        console.error("Error fetching contact:", e);
        throw e;
      }
    },
  });
  
  // Query to fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", contactId],
    queryFn: async () => {
      try {
        // This would normally fetch from the Tauri backend
        // return await invoke<Message[]>("get_messages", { contactId });
        
        // For demonstration, return mock data
        return [
          { id: 1, content: "Hi there!", is_from_user: false, timestamp: "2023-03-01T10:00:00Z" },
          { id: 2, content: "Hello! How can I help you today?", is_from_user: false, timestamp: "2023-03-01T10:01:00Z" },
          { id: 3, content: "I'm looking for information about the MCP protocol.", is_from_user: true, timestamp: "2023-03-01T10:02:00Z" },
          { id: 4, content: "The Model Context Protocol (MCP) is a standardized protocol for AI model interactions. It provides consistent handling of prompts, ephemeral sessions, and multi-agent chaining.", is_from_user: false, timestamp: "2023-03-01T10:03:00Z" },
        ] as Message[];
      } catch (e) {
        console.error("Error fetching messages:", e);
        throw e;
      }
    },
  });
  
  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      try {
        // This would normally send to the Tauri backend
        // return await invoke<Message>("send_message", { contactId, content });
        
        // For demonstration, return a mock response
        return {
          id: Math.floor(Math.random() * 1000),
          content,
          is_from_user: true,
          timestamp: new Date().toISOString(),
        } as Message;
      } catch (e) {
        console.error("Error sending message:", e);
        throw e;
      }
    },
    onSuccess: (newMessage) => {
      // Update the messages query with the new message
      queryClient.setQueryData(["messages", contactId], (old: Message[] = []) => [
        ...old,
        newMessage,
      ]);
      
      // Simulate a response from the contact
      setTimeout(() => {
        const responseMessage = {
          id: Math.floor(Math.random() * 1000),
          content: `I'm responding to your message: "${newMessage.content}"`,
          is_from_user: false,
          timestamp: new Date().toISOString(),
        };
        
        queryClient.setQueryData(["messages", contactId], (old: Message[] = []) => [
          ...old,
          responseMessage,
        ]);
      }, 1000);
    },
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
      setMessage("");
    }
  };
  
  // Handle window dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  
  const onDrag = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };
  
  const endDrag = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", onDrag as any);
      document.addEventListener("mouseup", endDrag);
      return () => {
        document.removeEventListener("mousemove", onDrag as any);
        document.removeEventListener("mouseup", endDrag);
      };
    }
  }, [isDragging]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="aim-chat-window"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div 
        className="aim-window-header cursor-move"
        onMouseDown={startDrag}
      >
        <div className="text-sm font-bold">
          Chat with {contact?.name || "Loading..."}
        </div>
        <button 
          className="text-white hover:text-gray-300"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      
      <div className="aim-chat-messages h-64">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`aim-message ${msg.is_from_user ? "aim-message-user" : "aim-message-other"}`}
          >
            <div className="text-xs text-gray-500 mb-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="aim-chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="aim-input flex-grow mr-2"
        />
        <button type="submit" className="aim-button">
          Send
        </button>
      </form>
    </motion.div>
  );
}