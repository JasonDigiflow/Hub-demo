'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FAQ_DATA } from '@/lib/premiumApplications';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <motion.div
      layout
      className="faq-item glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white pr-4">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-purple-400"
          >
            <path
              d="M7 10L12 15L17 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 text-white/70 leading-relaxed border-t border-white/10 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CategoryTab = ({ category, isActive, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-full font-medium transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
          : 'glass-card text-white/70 hover:text-white hover:bg-white/10'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {category}
    </motion.button>
  );
};

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState(FAQ_DATA[0].category);
  const [openItems, setOpenItems] = useState({});
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentCategoryData = FAQ_DATA.find(cat => cat.category === activeCategory);
  const currentCategoryIndex = FAQ_DATA.findIndex(cat => cat.category === activeCategory);

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
          >
            <span className="text-purple-400">💡</span>
            <span className="text-sm text-white/70 font-medium">Questions fréquentes</span>
          </motion.div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-4">
            <span className="text-white">Tout ce que vous devez </span>
            <span className="gradient-text">savoir</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Trouvez rapidement les réponses à vos questions sur DigiFlow et nos solutions d'automatisation
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {FAQ_DATA.map((category) => (
            <CategoryTab
              key={category.category}
              category={category.category}
              isActive={activeCategory === category.category}
              onClick={() => setActiveCategory(category.category)}
            />
          ))}
        </motion.div>

        {/* FAQ items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentCategoryData?.questions.map((item, index) => (
                <FAQItem
                  key={`${activeCategory}-${index}`}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openItems[`${currentCategoryIndex}-${index}`]}
                  onClick={() => toggleItem(currentCategoryIndex, index)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-white/60 mb-6">Vous ne trouvez pas la réponse que vous cherchez ?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-gradient px-8 py-3 rounded-full font-semibold text-white shadow-lg shadow-purple-500/25"
            >
              Contacter le support
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-card px-8 py-3 rounded-full font-semibold text-white hover:bg-white/10 transition-colors"
            >
              📚 Documentation complète
            </motion.button>
          </div>
        </motion.div>

        {/* Floating question marks decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-purple-400/10 text-6xl font-bold"
              style={{
                left: `${20 + i * 20}%`,
                top: `${10 + i * 15}%`
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            >
              ?
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}