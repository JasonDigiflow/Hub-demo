'use client';

import { useRef, useState, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import { useSpring, animated, config } from '@react-spring/web';
import { PREMIUM_APPLICATIONS } from '@/lib/premiumApplications';

const FloatingLogo = ({ app, initialPosition, index }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: initialPosition.x,
    y: initialPosition.y,
    scale: 1,
    config: config.gentle
  }));

  // Animation de flottement autonome
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        api.start({
          x: initialPosition.x + Math.sin(Date.now() / 1000 + index) * 20,
          y: initialPosition.y + Math.cos(Date.now() / 1500 + index) * 15,
        });
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isDragging, initialPosition, index, api]);

  const bind = useDrag(
    ({ active, movement: [mx, my] }) => {
      setIsDragging(active);
      if (active) {
        api.start({
          x: initialPosition.x + mx,
          y: initialPosition.y + my,
          scale: 1.2,
          immediate: true
        });
      } else {
        // Snap back avec effet de ressort
        api.start({
          x: initialPosition.x,
          y: initialPosition.y,
          scale: 1,
          config: { tension: 200, friction: 25 }
        });
      }
    },
    { 
      filterTaps: true,
      bounds: { left: -300, right: 300, top: -200, bottom: 200 }
    }
  );

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        scale,
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -40,
        marginTop: -40,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 100 : 10 + index
      }}
      className="floating-logo-container"
    >
      <div 
        className={`
          floating-logo glass-logo
          ${isDragging ? 'dragging' : ''}
        `}
        style={{
          background: app.gradient,
          animationDelay: `${index * 0.5}s`
        }}
      >
        <span className="text-3xl">{app.icon}</span>
        {isDragging && (
          <div className="logo-trail" style={{ background: app.gradient }} />
        )}
      </div>
      <div className={`logo-name ${isDragging ? 'visible' : ''}`}>
        {app.name}
      </div>
    </animated.div>
  );
};

export default function FloatingLogos() {
  const positions = [
    { x: -250, y: -100 },
    { x: 200, y: -150 },
    { x: -200, y: 100 },
    { x: 250, y: 50 },
    { x: -100, y: -180 },
    { x: 100, y: 180 },
    { x: -280, y: 0 },
    { x: 280, y: -50 }
  ];

  return (
    <div className="floating-logos-container">
      {PREMIUM_APPLICATIONS.map((app, index) => (
        <FloatingLogo
          key={app.id}
          app={app}
          initialPosition={positions[index]}
          index={index}
        />
      ))}
      
      {/* Effet de particules en arrière-plan */}
      <div className="particles-overlay">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}