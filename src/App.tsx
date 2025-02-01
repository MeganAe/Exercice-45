import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import {
  ChatBubbleLeftIcon,
  PhotoIcon,
  UserCircleIcon,
  InformationCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Types
interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
  imageUrl?: string;
}

interface MenuItem {
  label: string;
  icon: any;
  action: () => void;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const API_KEY = "AIzaSyDSrtttEykprVBleLk9iWXMZZeJCt3bBRk";
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  const generateImage = async (query: string) => {
    try {
      const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
        responseType: 'arraybuffer'
      });
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Chat',
      icon: ChatBubbleLeftIcon,
      action: () => {
        toast.success('Switched to Chat mode');
        setIsMenuOpen(false);
      }
    },
    {
      label: 'Image Generation',
      icon: PhotoIcon,
      action: () => {
        setInput('/poli ');
        toast('Type your image prompt after "/poli"', {
          icon: '🎨',
          duration: 3000
        });
        setIsMenuOpen(false);
      }
    },
    {
      label: 'Profile',
      icon: UserCircleIcon,
      action: () => {
        toast('Profile feature coming soon!', {
          icon: '👤'
        });
        setIsMenuOpen(false);
      }
    },
    {
      label: 'About',
      icon: InformationCircleIcon,
      action: () => {
        toast('Created by Metoushela Walker', {
          icon: 'ℹ️'
        });
        setIsMenuOpen(false);
      }
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      content: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if it's a poli command
      if (input.toLowerCase().startsWith('/poli')) {
        const imagePrompt = input.slice(6); // Remove "/poli " from the input
        toast.loading('Generating image...', { id: 'imageGen' });
        const imageUrl = await generateImage(imagePrompt);
        
        if (imageUrl) {
          const botResponse: Message = {
            content: "Here's your generated image using Poli:",
            isBot: true,
            timestamp: new Date(),
            imageUrl: imageUrl
          };
          setMessages(prev => [...prev, botResponse]);
          toast.success('Image generated successfully!', { id: 'imageGen' });
        }
      } else {
        toast.loading('Thinking...', { id: 'thinking' });
        // Text response from Gemini API
        const response = await axios.post(API_URL, {
          contents: [{ parts: [{ text: input }] }]
        });
        
        const botResponse: Message = {
          content: response.data.candidates[0].content.parts[0].text,
          isBot: true,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, botResponse]);
        toast.success('Response received!', { id: 'thinking' });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Helmet>
        <title>Metoushela AI - Intelligent ChatBot</title>
        <meta name="description" content="AI ChatBot by Metoushela Walker" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
      </Helmet>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Metoushela AI
              </div>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-700"
            >
              <div className="px-4 py-2 space-y-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Chat Container */}
      <main className="container mx-auto px-4 pt-24 pb-24">
        <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-lg shadow-xl backdrop-blur-sm border border-gray-700 min-h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] ${message.isBot ? 'bg-gray-700' : 'bg-blue-600'} rounded-lg p-4`}>
                    <p className="text-sm">{message.content}</p>
                    {message.imageUrl && (
                      <motion.img 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={message.imageUrl} 
                        alt="Generated Image" 
                        className="mt-2 rounded-lg max-w-full h-auto"
                      />
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Chat normally or use /poli for image generation..."
                className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-2 font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-gray-900/50 backdrop-blur-sm border-t border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-sm text-gray-400">
            Created by Metoushela Walker | Fullstack Developer & Graphic Designer
          </div>
        </div>
      </footer>
    </div>
  );
          }
