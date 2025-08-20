'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { zoeResponses } from '@/lib/mockData';

export default function ZoeAI() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: "Bonjour ! Je suis Zoë, votre assistante IA spécialisée dans la gestion des avis clients. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getZoeResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    for (const response of zoeResponses) {
      if (response.trigger !== 'default' && input.includes(response.trigger)) {
        return response.response;
      }
    }
    
    const defaultResponse = zoeResponses.find(r => r.trigger === 'default');
    return defaultResponse.response;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const zoeMessage = {
        id: messages.length + 2,
        type: 'assistant',
        text: getZoeResponse(inputValue),
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, zoeMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    "Comment améliorer ma note moyenne ?",
    "Rédige une réponse pour un avis négatif",
    "Montre-moi mes statistiques",
    "Quelles sont les meilleures pratiques ?"
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">Zoë AI</span> Assistant
            </h1>
            <p className="text-white/70">
              Votre assistante IA pour la gestion des avis clients
            </p>
          </div>
          <Link href="/app/fidalyz">
            <Button variant="outline">
              ← Retour au dashboard
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-6rem)]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-hide">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[70%] p-4 rounded-2xl
                    ${message.type === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                      : 'bg-white/10 text-white/90'
                    }
                  `}>
                    {message.type === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs">Z</span>
                        </div>
                        <span className="text-xs text-white/50">Zoë</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs mt-2 opacity-70">{message.timestamp}</p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question à Zoë..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
                  Envoyer →
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="p-6 h-full">
            <h3 className="font-bold mb-4">Suggestions</h3>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(prompt)}
                  className="w-full text-left p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-sm text-white/70 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="font-bold mb-4">Capacités de Zoë</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Rédaction de réponses personnalisées</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Analyse de sentiment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Suggestions d'amélioration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Rapports et statistiques</span>
                </li>
              </ul>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}