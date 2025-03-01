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
    <div className="login-form-container">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ width: 'var(--qb-login-width)', height: 'var(--qb-login-height)' }}
        className="aim-window max-w-md mx-auto shadow-xl"
      >
        <div className="aim-window-header">
          <h2 className="text-xl font-bold tracking-wide">
            <span className="header-icon">⚡</span>
            <span>Quick-Bots Desktop</span>
          </h2>
        </div>
        
        <div className="aim-window-body">
          <div className="flex justify-center mb-8">
            <h1 className="welcome-text">Welcome!</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Screen Name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your screen name"
                className="aim-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="aim-input"
                required
              />
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember Me</span>
              </label>
              
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            
            <div className="form-submit">
              <button 
                type="submit" 
                className="aim-button"
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