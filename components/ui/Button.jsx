export default function Button({ 
  children, 
  onClick, 
  variant = 'gradient', 
  className = '',
  type = 'button',
  disabled = false,
  fullWidth = false 
}) {
  const baseClasses = 'font-semibold transition-all duration-300 rounded-xl inline-flex items-center justify-center';
  
  const variants = {
    gradient: 'btn-gradient',
    outline: 'btn-outline',
    ghost: 'text-white hover:bg-white/10 px-6 py-3'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}