import { useState } from "react";
import { motion } from "framer-motion";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="aim-window w-96"
      >
        <div className="aim-window-header">
          <h2 className="text-lg font-bold">Tauri App Sign In</h2>
        </div>
        
        <div className="aim-window-body">
          <div className="flex justify-center mb-4">
            <img 
              src="/aim-logo.png" 
              alt="AIM Logo" 
              className="w-32 h-32"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.src = "https://placehold.co/128x128?text=AIM";
              }}
            />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-gray-700 mb-1">
                Screen Name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Screen Name"
                className="aim-input w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="aim-input w-full"
                required
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Remember Me</span>
              </label>
              
              <a href="#" className="text-sm text-blue-600">
                Forgot Password?
              </a>
            </div>
            
            <div>
              <button 
                type="submit" 
                className="aim-button w-full"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}