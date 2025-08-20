export default function GlassCard({ children, className = '', hover = true }) {
  return (
    <div className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}