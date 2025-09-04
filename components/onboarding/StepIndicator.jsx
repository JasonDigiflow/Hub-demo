'use client';

import { motion } from 'framer-motion';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center space-x-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="relative">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isActive 
                    ? 'rgba(139, 92, 246, 0.2)' 
                    : isCompleted 
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)'
                }}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${isActive 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/50' 
                    : isCompleted 
                    ? 'border-green-500' 
                    : 'border-white/20'
                  }
                `}
              >
                {isCompleted ? (
                  <span className="text-green-400 text-xl">✓</span>
                ) : (
                  <span className="text-xl">{step.icon}</span>
                )}
              </motion.div>
              
              <div className={`
                absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap
                text-xs font-medium transition-colors duration-300
                ${isActive ? 'text-purple-400' : isCompleted ? 'text-green-400' : 'text-white/40'}
              `}>
                {step.name}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-2 transition-all duration-300
                ${step.id < currentStep ? 'bg-green-500' : 'bg-white/20'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}