import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';

export default function AppCard({ app }) {
  const isActive = app.status === 'active';
  const IconComponent = app.Icon;
  
  const CardContent = () => (
    <GlassCard 
      className={`
        p-6 h-full flex flex-col justify-between
        ${isActive ? 'cursor-pointer' : 'opacity-60'}
      `}
      hover={isActive}
    >
      <div>
        <div className={`
          w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} 
          flex items-center justify-center mb-4 shadow-lg
        `}>
          {IconComponent ? (
            <IconComponent className="w-10 h-10" />
          ) : (
            <span className="text-3xl">{app.emoji}</span>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{app.name}</h3>
        <p className="text-sm text-white/70">{app.description}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        {isActive ? (
          <div className="flex items-center justify-between">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Actif
            </span>
            <span className="text-white/50">→</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-white/30 text-sm flex items-center gap-1">
              🔒 Bientôt disponible
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );

  if (isActive && app.path) {
    return (
      <Link href={app.path}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}