'use client';

export default function Button({ 
  children, 
  onClick, 
  variant = 'gradient', 
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const baseClasses = `
    px-6 py-3
    font-semibold 
    rounded-lg
    transition-all duration-200
    inline-flex items-center justify-center
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variants = {
    gradient: `
      bg-gradient-to-r from-purple-500 to-blue-500
      text-white
      hover:from-purple-600 hover:to-blue-600
      shadow-lg shadow-purple-500/25
      hover:shadow-xl hover:shadow-purple-500/30
    `,
    outline: `
      bg-transparent
      border border-white/20
      text-white
      hover:bg-white/10
      hover:border-white/30
      backdrop-blur-sm
    `,
    ghost: `
      bg-transparent
      text-white/80
      hover:text-white
      hover:bg-white/10
    `,
    glass: `
      bg-white/10
      backdrop-blur-lg
      border border-white/20
      text-white
      hover:bg-white/20
      hover:border-white/30
      shadow-sm
    `
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${variants[variant] || variants.gradient} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}