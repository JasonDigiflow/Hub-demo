'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SimpleChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour! 👋 Je suis l'assistant DigiFlow. Comment puis-je vous aider?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isBot: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: data.response || "Je suis là pour vous aider avec DigiFlow!",
        isBot: true,
        aiGenerated: data.aiGenerated
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Désolé, je rencontre un problème. Veuillez réessayer.",
        isBot: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
          zIndex: 9999,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        <span style={{ fontSize: '24px', color: 'white' }}>
          {isOpen ? '✕' : '💬'}
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            height: '500px',
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 'bold' }}>Assistant DigiFlow</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                  {isTyping ? 'En train d\'écrire...' : 'En ligne'}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.isBot ? 'flex-start' : 'flex-end'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  background: msg.isBot 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                  color: 'white',
                  fontSize: '14px',
                  position: 'relative'
                }}>
                  {msg.text}
                  {msg.isBot && msg.aiGenerated && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: '#9333ea',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      IA
                    </span>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '4px', padding: '10px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite',
                  animationDelay: '0.2s'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite',
                  animationDelay: '0.4s'
                }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tapez votre message..."
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}