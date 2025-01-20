/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Position {
  top: number;
  left: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
}

const LevelOne = () => {
  const router = useRouter();
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const MAX_CLICKS = 10;

  // Initialize button position to center of screen
  useEffect(() => {
    const centerX = window.innerWidth / 2 - 50; // 50 is half the button width
    const centerY = window.innerHeight / 2 - 25; // 25 is half the button height
    setPosition({ top: centerY, left: centerX });
  }, []);

  useEffect(() => {
    if (clickCount >= MAX_CLICKS) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/level/2");
      }, 2000);
    }
  }, [clickCount, router]);

  const createParticles = (x: number, y: number): void => {
    const newParticles: Particle[] = Array.from({ length: 10 }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (Math.PI * 2 * i) / 10,
      velocity: 5 + Math.random() * 5,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 1000);
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent any default behavior
    const rect = e.currentTarget.getBoundingClientRect();
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    moveButton(e);
    setClickCount((prev) => prev + 1);
  };

  const moveButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    const boundingBox = e.currentTarget.getBoundingClientRect();
    const buttonWidth = boundingBox.width;
    const buttonHeight = boundingBox.height;

    // Make the movement more erratic based on click count
    const range = 100 + clickCount * 20;
    const offsetX = (Math.random() - 0.5) * range * 2;
    const offsetY = (Math.random() - 0.5) * range * 2;

    // Calculate new position
    const newLeft = Math.min(
      window.innerWidth - buttonWidth,
      Math.max(0, boundingBox.left + offsetX),
    );
    const newTop = Math.min(
      window.innerHeight - buttonHeight,
      Math.max(0, boundingBox.top + offsetY),
    );

    setPosition({
      left: newLeft,
      top: newTop,
    });
  };

  const progressPercentage = (clickCount / MAX_CLICKS) * 100;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Progress Bar */}
      <motion.div
        className="absolute left-0 top-0 h-2 bg-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.3 }}
      />

      {/* Score Display */}
      <motion.div
        className="absolute left-4 top-4 text-xl text-white"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.3 }}
        key={clickCount}
      >
        Clicks: {clickCount}/{MAX_CLICKS}
      </motion.div>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute h-2 w-2 rounded-full bg-blue-400"
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: particle.x + Math.cos(particle.angle) * particle.velocity * 50,
              y: particle.y + Math.sin(particle.angle) * particle.velocity * 50,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Bouncing Button */}
      <motion.button
        tabIndex={-1}
        className="absolute z-50 cursor-pointer select-none rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-4 font-bold text-white shadow-lg"
        style={{
          top: position.top,
          left: position.left,
          width: "100px", // Fixed width
          height: "50px", // Fixed height
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, clickCount % 2 ? 5 : -5, 0],
          boxShadow: [
            "0 0 10px rgba(59, 130, 246, 0.5)",
            "0 0 20px rgba(59, 130, 246, 0.7)",
            "0 0 10px rgba(59, 130, 246, 0.5)",
          ],
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
        onMouseEnter={moveButton}
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
      >
        Submit!
      </motion.button>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-4xl font-bold text-white"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
            >
              Level Complete! 🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="bg-gradient-radial absolute inset-0 from-transparent to-black opacity-50" />
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-blue-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LevelOne;
