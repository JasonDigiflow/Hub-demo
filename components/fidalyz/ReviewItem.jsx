import Button from '@/components/ui/Button';

export default function ReviewItem({ review, onRespond }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-white/20'}>
        ★
      </span>
    ));
  };

  const platformColors = {
    Google: 'from-blue-500 to-blue-600',
    TripAdvisor: 'from-green-500 to-green-600',
    Facebook: 'from-indigo-500 to-indigo-600'
  };

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-xl">{review.avatar}</span>
          </div>
          <div>
            <p className="font-semibold">{review.author}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`
                text-xs px-2 py-1 rounded-full bg-gradient-to-r ${platformColors[review.platform]}
              `}>
                {review.platform}
              </span>
              <span className="text-xs text-white/50">{review.date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div>{renderStars(review.rating)}</div>
          {review.status === 'responded' ? (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
              ✓ Répondu
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">
              En attente
            </span>
          )}
        </div>
      </div>

      <p className="text-white/80 mb-3">{review.text}</p>

      {review.response ? (
        <div className="p-3 bg-white/5 rounded-lg border-l-2 border-purple-500">
          <p className="text-sm text-white/70">
            <span className="font-semibold text-purple-400">Votre réponse :</span><br />
            {review.response}
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-sm py-2 px-4"
            onClick={() => onRespond(review)}
          >
            Répondre
          </Button>
          <Button
            variant="ghost"
            className="text-sm py-2 px-4"
          >
            Demander à Zoë
          </Button>
        </div>
      )}
    </div>
  );
}