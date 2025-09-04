'use client';

export default function GlassCard({ children, className = '', hover = false }) {
  return (
    <div 
      className={`
        relative
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-2xl
        ${hover ? 'hover:bg-white/10 hover:border-white/20 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}