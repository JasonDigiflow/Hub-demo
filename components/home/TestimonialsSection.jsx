'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TESTIMONIALS } from '@/lib/premiumApplications';

const TestimonialCard = ({ testimonial, index }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const sizeClasses = {
    large: 'col-span-2 row-span-2',
    medium: 'col-span-1 row-span-2',
    small: 'col-span-1 row-span-1'
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={`
        testimonial-card glass-card p-6 lg:p-8
        ${sizeClasses[testimonial.size]}
        hover:scale-[1.02] transition-all duration-300
      `}
    >
      {/* Badge vérifié */}
      {testimonial.verified && (
        <div className="verified-badge">
          <span className="text-xs">✓ Vérifié</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="avatar-premium">
            <span className="text-2xl">{testimonial.avatar}</span>
            <div className="avatar-ring" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{testimonial.name}</h4>
            <p className="text-sm text-white/60">{testimonial.role}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <span key={i} className="text-yellow-400">★</span>
          ))}
        </div>
      </div>

      {/* Highlight stat */}
      {testimonial.highlight && (
        <div className="highlight-stat">
          <span className="text-2xl lg:text-3xl font-bold gradient-text">
            {testimonial.highlight}
          </span>
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-white/80 mt-4 leading-relaxed">
        "{testimonial.text}"
      </blockquote>

      {/* Decorative element */}
      <div className="quote-decoration">
        <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
          <path
            d="M0 20C0 8.954 8.954 0 20 0v10c-5.523 0-10 4.477-10 10s4.477 10 10 10v10C8.954 40 0 31.046 0 20z"
            fill="url(#gradient-quote)"
            opacity="0.1"
          />
          <defs>
            <linearGradient id="gradient-quote" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
};

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold mb-4">
            <span className="text-white">Ils ont transformé leur </span>
            <span className="gradient-text">business</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Découvrez comment les leaders du marché utilisent DigiFlow pour automatiser et scaler leur croissance
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="testimonials-bento-grid">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8"
        >
          <div className="trust-badge">
            <span className="text-3xl font-bold gradient-text">15k+</span>
            <span className="text-white/60">Utilisateurs actifs</span>
          </div>
          <div className="trust-badge">
            <span className="text-3xl font-bold gradient-text">4.9/5</span>
            <span className="text-white/60">Note moyenne</span>
          </div>
          <div className="trust-badge">
            <span className="text-3xl font-bold gradient-text">99.9%</span>
            <span className="text-white/60">Uptime garanti</span>
          </div>
          <div className="trust-badge">
            <span className="text-3xl font-bold gradient-text">24/7</span>
            <span className="text-white/60">Support premium</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}