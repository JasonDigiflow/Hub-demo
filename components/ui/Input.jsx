'use client';

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  required = false,
  className = '',
  label,
  icon,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/50">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full 
            px-4 py-3
            bg-white/5
            backdrop-blur-lg
            border border-white/10
            rounded-lg
            text-white
            placeholder:text-white/40
            focus:outline-none
            focus:border-purple-500/50
            focus:bg-white/10
            transition-all duration-200
            ${icon ? 'pl-12' : 'px-4'} 
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
}