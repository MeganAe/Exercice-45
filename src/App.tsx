import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { FiSend, FiMenu, FiBell, FiUser } from 'react-icons/fi';

const API_KEY = "AIzaSyDSrtttEykprVBleLk9iWXMZZeJCt3bBRk";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

interface Message {
  content: string;
  isUser: boolean;
  image?: string;
}

interface NotificationBadge {
  count: number;
}

const NotificationBadge = ({ count }: NotificationBadge) => (
  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
    {count}
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNotificationClick = () => {
    toast('You have new messages!', {
      icon: '🔔',
      duration: 3000,
    });
    setNotificationCount(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { content: userMessage, isUser: true }]);

    setIsLoading(true);

    try {
      if (userMessage.startsWith('/poli')) {
        const query = encodeURIComponent(userMessage.slice(6));
        const imageUrl = `https://image.pollinations.ai/prompt/${query}`;
        
        setMessages(prev => [...prev, {
          content: 'Generated image:',
          isUser: false,
          image: imageUrl
        }]);
        
        toast.success('Image generated successfully!');
      } else {
        const response = await axios.post(API_URL, {
          contents: [{ parts: [{ text: userMessage }] }]
        });

        const botResponse = response.data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { content: botResponse, isUser: false }]);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-900/90 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"
              >
                <span className="text-xl">🤖</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
              >
                Metoushela AI
              </motion.h1>
            </div>

            {/* Navigation for Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="hover:text-blue-400 transition-colors">Home</a>
              <a href="#" className="hover:text-blue-400 transition-colors">About</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Chat</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
                onClick={handleNotificationClick}
              >
                <FiBell className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
                {notificationCount > 0 && <NotificationBadge count={notificationCount} />}
              </motion.button>

              {/* User Profile */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiUser className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden"
              >
                <FiMenu className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed top-16 right-0 w-64 bg-gray-800 p-4 z-40 rounded-l-lg shadow-xl"
          >
            <nav className="flex flex-col gap-4">
              <a href="#" className="hover:text-blue-400 transition-colors">Home</a>
              <a href="#" className="hover:text-blue-400 transition-colors">About</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Chat</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Container */}
      <main className="container mx-auto px-4 pt-24 pb-32">
        <div className="max-w-3xl mx-auto bg-gray-800/50 rounded-lg backdrop-blur-sm shadow-xl p-4 min-h-[calc(100vh-16rem)]">
          <div className="space-y-4 mb-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg p-4 ${
                    message.isUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-100'
                  }`}>
                    <p>{message.content}</p>
                    {message.image && (
                      <img 
                        src={message.image} 
                        alt="Generated" 
                        className="mt-2 rounded-lg max-w-full h-auto"
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Form */}
      <form 
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full bg-gray-900/90 backdrop-blur-sm py-4"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message... (use /poli for image generation)"
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 flex items-center gap-2 transition-colors"
            >
              <FiSend className="w-5 h-5" />
              Send
            </motion.button>
          </div>
        </div>
      </form>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-gray-900 text-gray-400 text-sm py-2 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <p>Created by Metoushela Walker</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
          }
