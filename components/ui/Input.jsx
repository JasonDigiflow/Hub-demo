export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  required = false,
  className = '',
  label,
  icon
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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
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
            ${icon ? 'pl-12' : ''} 
            ${className}
          `}
        />
      </div>
    </div>
  );
}