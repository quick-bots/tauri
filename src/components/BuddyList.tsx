import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface Contact {
  id: number;
  name: string;
  status: string;
  category: string;
}

interface BuddyListProps {
  username: string;
  onOpenChat: (contactId: number) => void;
}

export function BuddyList({ username, onOpenChat }: BuddyListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Buddies": true,
    "AI Agents": true,
    "Co-Workers": true,
    "Family": true,
  });
  
  // Query to fetch contacts from backend
  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      try {
        // This would normally fetch from the Tauri backend
        // return await invoke<Contact[]>("get_contacts");
        
        // For demonstration, return mock data
        return [
          { id: 1, name: "Claude AI", status: "online", category: "AI Agents" },
          { id: 2, name: "GPT-4", status: "online", category: "AI Agents" },
          { id: 3, name: "Anthropic", status: "away", category: "AI Agents" },
          { id: 4, name: "Sarah", status: "online", category: "Buddies" },
          { id: 5, name: "Mike", status: "offline", category: "Buddies" },
          { id: 6, name: "Jessica", status: "away", category: "Co-Workers" },
          { id: 7, name: "Dad", status: "offline", category: "Family" },
        ] as Contact[];
      } catch (e) {
        console.error("Error fetching contacts:", e);
        throw e;
      }
    },
  });
  
  // Group contacts by category
  const contactsByCategory = contacts.reduce((acc, contact) => {
    if (!acc[contact.category]) {
      acc[contact.category] = [];
    }
    acc[contact.category].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  return (
    <motion.div 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="aim-buddy-list"
    >
      <div className="aim-window-header flex justify-between items-center">
        <span className="font-bold">Buddy List</span>
        <span className="text-sm">{username}</span>
      </div>
      
      <div className="p-2">
        {isLoading ? (
          <div className="p-4 text-center">Loading buddies...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">Error loading contacts</div>
        ) : (
          Object.entries(contactsByCategory).map(([category, categoryContacts]) => (
            <div key={category} className="mb-2">
              <div 
                className="aim-buddy-category flex justify-between"
                onClick={() => toggleCategory(category)}
              >
                <span>{category}</span>
                <span>{expandedCategories[category] ? "▼" : "►"}</span>
              </div>
              
              <AnimatePresence>
                {expandedCategories[category] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    {categoryContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className="aim-buddy-item"
                        onClick={() => onOpenChat(contact.id)}
                      >
                        <div className={`aim-status aim-status-${contact.status}`} />
                        <span>{contact.name}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}