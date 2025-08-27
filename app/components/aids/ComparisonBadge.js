'use client';

export default function ComparisonBadge({ value, previousValue, format = 'number' }) {
  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return null;
    return ((value - previousValue) / previousValue * 100).toFixed(1);
  };
  
  const formatValue = (val) => {
    if (format === 'currency') {
      return `${val.toFixed(2)}€`;
    }
    if (format === 'percent') {
      return `${val.toFixed(1)}%`;
    }
    if (format === 'number' && val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val.toString();
  };
  
  const change = calculateChange();
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  if (!change) return null;
  
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className={`flex items-center gap-0.5 ${
        isPositive ? 'text-green-400' : 
        isNegative ? 'text-red-400' : 
        'text-gray-400'
      }`}>
        {isPositive && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {isNegative && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {Math.abs(change)}%
      </span>
      {previousValue && (
        <span className="text-gray-500">
          vs {formatValue(previousValue)}
        </span>
      )}
    </div>
  );
}