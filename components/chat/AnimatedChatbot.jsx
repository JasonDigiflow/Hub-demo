'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatMessage = ({ message, isBot }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}
  >
    <div
      className={`
        max-w-[80%] px-4 py-2 rounded-2xl text-sm
        ${isBot 
          ? 'glass-card text-white/90' 
          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        }
      `}
    >
      {message}
    </div>
  </motion.div>
);

export default function AnimatedChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour! 👋 Comment puis-je vous aider aujourd'hui?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);

  // Suggestions rapides
  const quickActions = [
    "Découvrir DigiFlow",
    "Voir les tarifs",
    "Démo gratuite",
    "Parler à un expert"
  ];

  const handleSend = (text) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses = {
        "Découvrir DigiFlow": "DigiFlow est une plateforme tout-en-un qui automatise votre business avec 8 applications puissantes. Voulez-vous une démo personnalisée?",
        "Voir les tarifs": "Nos plans démarrent à 49€/mois. Chaque application peut être activée selon vos besoins. Essai gratuit de 14 jours disponible!",
        "Démo gratuite": "Parfait! Je peux programmer une démo avec notre équipe. Quel créneau vous conviendrait le mieux?",
        "Parler à un expert": "Je transfère votre demande à notre équipe. Un expert vous contactera dans les 24h. Puis-je avoir votre email?"
      };

      const response = botResponses[messageText] || 
        "Je comprends votre question. Notre équipe sera ravie de vous aider. Souhaitez-vous programmer un appel?";

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: response,
        isBot: true
      }]);
    }, 1500);
  };

  // Auto-open after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPulseAnimation(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Chat button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            setPulseAnimation(false);
          }}
          className="relative w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulse animation */}
          {pulseAnimation && !isOpen && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1.5],
                opacity: [0.5, 0, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          )}
          
          {/* Icon */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.svg
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.svg>
            ) : (
              <motion.svg
                key="chat"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}
          </AnimatePresence>

          {/* Notification badge */}
          {!isOpen && pulseAnimation && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed bottom-28 right-6 w-96 h-[500px] glass-card rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Assistant DigiFlow</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    En ligne
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage key={message.id} {...message} />
                ))}
              </AnimatePresence>
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1 p-3"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-white/40 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Quick actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-white/60 mb-2">Suggestions rapides:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleSend(action)}
                      className="px-3 py-1 text-xs glass-card rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <motion.button
                  onClick={() => handleSend()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/25"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}