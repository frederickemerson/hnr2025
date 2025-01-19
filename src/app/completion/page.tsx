'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Star, PartyPopper as Party, Gift, Crown } from 'lucide-react';

const CompletionScreen = () => {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const [particleCount] = useState(50);
  const [floatingElements] = useState(Array(20).fill(null));
  const [showMainContent, setShowMainContent] = useState(false);
  const [showFinalButton, setShowFinalButton] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);


  useEffect(() => {
    // Set window height after component mounts
    setWindowHeight(window.innerHeight);
    
    setTimeout(() => setShowConfetti(true), 500);
    setTimeout(() => setShowMainContent(true), 1500);
    setTimeout(() => setShowFinalButton(true), 3000);
  }, []);

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    scale: Math.random() * 0.5 + 0.5,
    rotation: Math.random() * 360
  }));

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Matrix-style falling characters background */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white font-mono text-sm"
            style={{ left: `${i * 5}%` }}
            animate={{
              y: [-100, windowHeight + 100],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          >
            {Array.from({ length: 10 }).map((_, j) => (
              <div key={j} className="my-4">
                {String.fromCharCode(65 + Math.random() * 26)}
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Background particles */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            animate={{
              scale: [particle.scale, particle.scale * 1.5, particle.scale],
              opacity: [0.1, 0.3, 0.1],
              rotate: [particle.rotation, particle.rotation + 360]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Floating decoration elements */}
      {floatingElements.map((_, index) => (
        <motion.div
          key={index}
          className="absolute text-white opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        >
          {index % 4 === 0 && <Star size={24} />}
          {index % 4 === 1 && <Party size={24} />}
          {index % 4 === 2 && <Gift size={24} />}
          {index % 4 === 3 && <Crown size={24} />}
        </motion.div>
      ))}

      {/* Confetti explosion */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 100 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4"
                initial={{
                  top: "50%",
                  left: "50%",
                  scale: 0
                }}
                animate={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  scale: Math.random() + 0.5,
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 1 + Math.random(),
                  ease: "easeOut"
                }}
              >
                <div className="w-full h-full rounded-sm bg-white opacity-30" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {showMainContent && (
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center h-full"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              type: "spring",
              stiffness: 100
            }}
          >
            <motion.div
              className="text-8xl font-bold text-white mb-8 font-mono"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              QUEST COMPLETE
            </motion.div>

            {/* Glitch effect text */}
            <motion.div 
              className="text-3xl text-white text-center mb-12 max-w-2xl px-4 font-mono relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                animate={{
                  x: [-2, 2, -2],
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                BUREAUCRATIC PROCESSING COMPLETE
              </motion.div>
              <motion.div
                className="mt-4 text-xl opacity-80"
                animate={{
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                YOUR PERSISTENCE HAS BEEN LOGGED AND ARCHIVED
              </motion.div>
            </motion.div>

            {/* Binary rain effect */}
             <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white font-mono text-xs"
            style={{
              left: `${i * 5}%`,
              top: -20
            }}
            animate={{
              y: [0, windowHeight + 20]
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j}>{Math.round(Math.random())}</div>
            ))}
          </motion.div>
        ))}
      </motion.div>

            {/* Return button */}
            <AnimatePresence>
              {showFinalButton && (
                <motion.button
                  onClick={() => router.push('/')}
                  className="relative bg-white text-black px-8 py-4 rounded-none text-xl font-mono font-bold overflow-hidden group"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-black"
                    animate={{
                      x: ['-100%', '100%'],
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="relative z-10 group-hover:blur-sm transition-all">INITIALIZE NEW QUEST</span>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanline effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white to-transparent opacity-[0.02]"
        animate={{
          y: [-100, windowHeight]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Static noise overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] opacity-20" />

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.4) 100%)'
        }} 
      />
    </div>
  );
};

export default CompletionScreen;
