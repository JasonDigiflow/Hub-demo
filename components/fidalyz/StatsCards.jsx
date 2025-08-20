import GlassCard from '@/components/ui/GlassCard';

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Avis',
      value: stats.totalReviews,
      icon: '📝',
      color: 'from-blue-500 to-indigo-500',
      trend: '+12%'
    },
    {
      label: 'Note Moyenne',
      value: `${stats.averageRating}/5`,
      icon: '⭐',
      color: 'from-yellow-500 to-orange-500',
      trend: '+0.3'
    },
    {
      label: 'Taux de Réponse',
      value: `${stats.responseRate}%`,
      icon: '💬',
      color: 'from-green-500 to-teal-500',
      trend: '+5%'
    },
    {
      label: 'Satisfaction',
      value: `${stats.satisfaction}%`,
      icon: '😊',
      color: 'from-purple-500 to-pink-500',
      trend: '+8%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <GlassCard key={card.label} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <span className="text-green-400 text-sm font-semibold">
              {card.trend}
            </span>
          </div>
          <p className="text-3xl font-bold mb-2">{card.value}</p>
          <p className="text-white/70 text-sm">{card.label}</p>
        </GlassCard>
      ))}
    </div>
  );
}