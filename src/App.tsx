import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Menu, X, Github, Linkedin, Twitter } from 'lucide-react';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState<Array<{type: string, content: string, image?: string}>>([
    {type: 'bot', content: 'Bonjour! Je suis Metoushela AI, votre assistant créé par Metoushela Walker. Comment puis-je vous aider aujourd\'hui?'}
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, {type: 'user', content: userMessage}]);
    setLoading(true);

    try {
      // Check if it's an image generation request
      if (userMessage.toLowerCase().includes('génère') && userMessage.toLowerCase().includes('image')) {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(userMessage)}`;
        setMessages(prev => [...prev, {type: 'bot', content: 'Voici l\'image générée:', image: imageUrl}]);
      } else {
        // Text response using Gemini API
        const response = await axios.post(API_URL, {
          contents: [{
            parts: [{text: userMessage}]
          }]
        });
        
        setMessages(prev => [...prev, {
          type: 'bot', 
          content: response.data.candidates[0].content.parts[0].text
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
      }]);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Metoushela AI</h1>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-full transition-all"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Sidebar Menu */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-black/80 backdrop-blur-md transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'} z-40`}>
        <div className="p-8 mt-16">
          <nav className="space-y-4">
            <a href="#" className="block text-white hover:text-purple-400 transition-colors">Accueil</a>
            <a href="#" className="block text-white hover:text-purple-400 transition-colors">À propos</a>
            <a href="#" className="block text-white hover:text-purple-400 transition-colors">Services</a>
            <a href="#" className="block text-white hover:text-purple-400 transition-colors">Contact</a>
          </nav>
          <div className="mt-8 flex space-x-4">
            <a href="#" className="text-white hover:text-purple-400"><Github /></a>
            <a href="#" className="text-white hover:text-purple-400"><Linkedin /></a>
            <a href="#" className="text-white hover:text-purple-400"><Twitter /></a>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="container mx-auto px-4 pt-24 pb-32">
        <div className="bg-black/30 backdrop-blur-md rounded-lg shadow-xl min-h-[600px] max-h-[80vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-purple-600' : 'bg-gray-700'} rounded-lg p-4 animate-fade-in`}>
                  <p className="text-white">{message.content}</p>
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Generated" 
                      className="mt-4 rounded-lg max-w-full h-auto"
                    />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              disabled={loading}
            >
              <Send size={20} />
              <span>Envoyer</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default App;