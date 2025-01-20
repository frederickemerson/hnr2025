import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CursorConfig {
  offsetX: number;
  offsetY: number;
  spinDuration: number;
  initialRotation: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
}

interface Position {
  x: number;
  y: number;
}

interface CursorProps {
  cursor: CursorConfig;
  index: number;
}

const CursorGame: React.FC = () => {
  const router = useRouter();
  const [tabSize, setTabSize] = useState<number>(150);
  const [fakeCursors, setFakeCursors] = useState<CursorConfig[]>([]);
  const [clicks, setClicks] = useState<number>(0);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [tabPos, setTabPos] = useState<Position>({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const TARGET_CLICKS = 5;
  const INITIAL_CURSORS = 4;
  const MAX_OFFSET = 500;
  const BASE_SPIN_DURATION = 2;

  const progressPercentage = (clicks / TARGET_CLICKS) * 100;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    generateCursors(INITIAL_CURSORS);
  }, []);

  const generateCursors = (count: number): void => {
    const newCursors: CursorConfig[] = [];
    for (let i = 0; i < count; i++) {
      newCursors.push({
        offsetX: (Math.random() - 0.5) * MAX_OFFSET,
        offsetY: (Math.random() - 0.5) * MAX_OFFSET,
        spinDuration: BASE_SPIN_DURATION + (Math.random() * 2 - 1),
        initialRotation: Math.random() * 360,
        amplitude: Math.random() * 50 + 25,
        frequency: Math.random() * 2 + 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    setFakeCursors(newCursors);
  };

  useEffect(() => {
    if (clicks >= TARGET_CLICKS) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        router.push("/level/3");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [clicks, router]);

  const createParticles = (x: number, y: number): void => {
    const newParticles: Particle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (Math.PI * 2 * i) / 12,
      velocity: 8 + Math.random() * 8,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 1000);
  };

  const handleClick = (e: React.MouseEvent): void => {
    if (clicks >= TARGET_CLICKS) return;

    createParticles(e.clientX, e.clientY);
    setClicks((prev) => prev + 1);

    const newCursorCount = fakeCursors.length * 4;
    generateCursors(newCursorCount);

    setTabSize((prev) => Math.max(prev * 0.3, 15));

    setTabPos({
      x: Math.random() * (window.innerWidth - 100),
      y: Math.random() * (window.innerHeight - 100),
    });
  };

  useEffect(() => {
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  const useCursorAnimation = (cursor: CursorConfig): Position => {
    const time = Date.now() * 0.001;
    const xOffset =
      cursor.offsetX +
      Math.sin(time * cursor.frequency + cursor.phase) * cursor.amplitude;
    const yOffset =
      cursor.offsetY +
      Math.cos(time * cursor.frequency + cursor.phase) * cursor.amplitude;

    return {
      x: mousePos.x + xOffset,
      y: mousePos.y + yOffset,
    };
  };

  const Cursor: React.FC<CursorProps> = ({ cursor }) => {
    const pos = useCursorAnimation(cursor);

    return (
      <motion.div
        className="pointer-events-none absolute select-none"
        style={{
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
        }}
        animate={{
          rotate: [cursor.initialRotation, cursor.initialRotation + 360],
          scale: [0.9, 1.1],
        }}
        transition={{
          rotate: {
            duration: cursor.spinDuration,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 0.8 + Math.random() * 0.4,
            repeat: Infinity,
            repeatType: "reverse",
          },
        }}
      >
        <svg width="24" height="24" viewBox="0 0 20 20">
          <motion.path
            d="M3.5,0 L3.5,14 L7,10.5 L10.5,15 L13,13.5 L9.5,9 L13.5,9 L3.5,0"
            fill="white"
            stroke="black"
            strokeWidth="1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    );
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black bg-gradient-to-b text-white">
      <motion.div
        className="absolute left-0 top-0 h-2 bg-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.3 }}
      />

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

      <Cursor
        cursor={{
          offsetX: 0,
          offsetY: 0,
          spinDuration: BASE_SPIN_DURATION,
          initialRotation: 0,
          amplitude: 0,
          frequency: 0,
          phase: 0,
        }}
        index={0}
      />

      {fakeCursors.map((cursor, index) => (
        <Cursor key={index} cursor={cursor} index={index} />
      ))}

      <motion.button
        tabIndex={-1}
        onClick={handleClick}
        className="absolute cursor-pointer overflow-hidden rounded-t-lg bg-white shadow-md"
        style={{
          left: tabPos.x,
          top: tabPos.y,
          width: `${tabSize}px`,
          height: `${Math.max(tabSize * 0.4, 15)}px`,
          zIndex: 10001,
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, Math.random() * 10 - 5],
          boxShadow: [
            "0 4px 6px rgba(0,0,0,0.1)",
            "0 8px 12px rgba(0,0,0,0.2)",
            "0 4px 6px rgba(0,0,0,0.1)",
          ],
        }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <motion.div className="flex h-full cursor-none items-center bg-blue-500 px-2 text-white hover:bg-blue-600">
          <motion.div
            className="mr-1 h-2 w-2 rounded-full bg-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <div
            className="truncate text-white"
            style={{ fontSize: `${Math.max(tabSize * 0.2, 8)}px` }}
          >
            {clicks >= TARGET_CLICKS ? "Completed!" : "Click me!"}
          </div>
        </motion.div>
      </motion.button>

      <motion.div
        className="no-select absolute right-4 top-4 text-lg font-bold text-gray-700"
        style={{ zIndex: 10001 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
        key={clicks}
      >
        {clicks >= TARGET_CLICKS
          ? "Loading next level..."
          : `Cursors: ${fakeCursors.length} | Clicks left: ${TARGET_CLICKS - clicks}`}
      </motion.div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
            style={{ zIndex: 10002 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center text-6xl font-bold text-white"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <div>Level Complete! 🎉</div>
              <motion.div
                className="mt-4 text-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Loading next challenge...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CursorGame;
