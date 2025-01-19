import React, { useState, useEffect } from "react";
import { Finger_Paint } from "next/font/google";
import Scary from "../assets/scary.png";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const fp = Finger_Paint({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface Position {
  x: number;
  y: number;
}

interface Direction extends Position {
  dx: number;
  dy: number;
}

const generateMaze = (rows: number, cols: number): string[][] => {
  const maze: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "#")
  );

  const isValid = (x: number, y: number): boolean =>
    x > 0 && x < rows - 1 && y > 0 && y < cols - 1;

  const stack: Position[] = [];
  const startX = 1;
  const startY = 1;

  if (maze[startX] && maze[startX][startY] !== undefined) {
    maze[startX][startY] = " ";
  }
  stack.push({ x: startX, y: startY });

  const directions: Array<[number, number]> = [
    [0, 2],
    [2, 0],
    [0, -2],
    [-2, 0]
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (!current) {
      stack.pop();
      continue;
    }

    const unvisitedNeighbors = directions
      .map(([dx, dy]) => ({
        x: current.x + dx,
        y: current.y + dy,
        dx,
        dy
      }))
      .filter(({ x, y }) => isValid(x, y) && maze[x]?.[y] === "#");

    if (unvisitedNeighbors.length > 0) {
      const neighbor =
        unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];

      if (neighbor) {
        const { x, y, dx, dy } = neighbor;
        if (maze[x] && maze[x][y] !== undefined) {
          maze[x][y] = " ";
        }
        const midX = current.x + dx / 2;
        const midY = current.y + dy / 2;

        if (
          midX >= 0 && midX < maze.length &&
          midY >= 0 && maze[midX]?.[midY] !== undefined
        ) {
          maze[midX][midY] = " ";
        }
        
        stack.push({ x, y });
      }
    } else {
      stack.pop();
    }
  }

  // Ensure indices are within bounds before modifying maze
  if (maze[0]?.[1] !== undefined) maze[0][1] = " ";
  const setMazeValue = (x: number, y: number, value: string) => {
    if (maze[x] && maze[x][y] !== undefined) {
      maze[x][y] = value;
    }
  };
  
  setMazeValue(rows - 2, cols - 2, " ");
  setMazeValue(rows - 2, cols - 3, " ");
  setMazeValue(rows - 3, cols - 2, " ");
  return maze;
};


const MazeGame: React.FC = () => {
  const [mazeLayout, setMazeLayout] = useState<string[][]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [timer, setTimer] = useState(30);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(5);

  const router = useRouter();

  useEffect(() => {
    const rows = 20;
    const cols = 20;
    setMazeLayout(generateMaze(rows, cols));
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setIsGameOver(true);
    } else if (!isGameOver && !hasWon && gameStarted) {
      const timerId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [timer, isGameOver, hasWon, gameStarted]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const mazeElement = document.getElementById("maze");
    if (!mazeElement || !mazeLayout[0]) return;

    const bounds = mazeElement.getBoundingClientRect();
    const x = Math.floor((e.clientX - bounds.left) / 30);
    const y = Math.floor((e.clientY - bounds.top) / 30);

    if ((y === 0 && x === 1) || (y === 1 && x === 1)) {
      if (!gameStarted) {
        setGameStarted(true);
      }
      return;
    }

    if (
      mazeLayout?.[y]?.[x] !== undefined // Ensure mazeLayout[y][x] is defined
    ) {
      if (mazeLayout[y][x] === " " || 
          (y === (mazeLayout.length ?? 0) - 2 && x === (mazeLayout[0]?.length ?? 0) - 2)) {
    
        if (y === (mazeLayout.length ?? 0) - 2 && x === (mazeLayout[0]?.length ?? 0) - 2) {
          setHasWon(true);
          const timer = setTimeout(() => {
            router.push('/level/5');
          }, 2000);
          return () => clearTimeout(timer);
        }
      } else if (mazeLayout[y][x] === "#" && gameStarted) {
        setIsGameOver(true);
      }
    }
  };

  const resetGame = () => {
    setCooldown(true);
    setCooldownTime(5);
    
    const cooldownInterval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownInterval);
          setCooldown(false);
          setIsGameOver(false);
          setHasWon(false);
          setTimer(30);
          setAudioPlayed(false);
          setGameStarted(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isGameOver) {
      playAudio();
      resetGame();
    }
  }, [isGameOver]);

  const playAudio = () => {
    if (!audioPlayed) {
      const audio = new Audio("/scary.mp3");
      audio.volume = 1;
      audio.play().catch(error => console.log('Audio play failed:', error));
      setAudioPlayed(true);
      
      setTimeout(() => {
        resetGame();
      }, 5000);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b bg-black">
      <div className={`${fp.className} mb-8 text-center text-2xl text-white`}>
        Enter through the green...<br/>
        <span className="text-red-500">and hope you aren't seen</span>
      </div>
      <span className="text-green-500">Click on the green zone to start</span>
      {gameStarted && !isGameOver && !hasWon && (
        <motion.div 
          className="absolute left-4 top-4 rounded-lg bg-gray-800 p-4 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={`${fp.className} ${timer < 10 ? "text-red-500" : "text-white"} text-xl`}>
            Time: {timer}s
          </span>
        </motion.div>
      )}

      <div
        id="maze"
        className="relative rounded-lg bg-gray-700 p-4 shadow-2xl"
        onMouseMove={handleMouseMove}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${mazeLayout[0]?.length || 0}, 30px)`,
          gridTemplateRows: `repeat(${mazeLayout.length}, 30px)`
        }}
      >
        {mazeLayout.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let cellClass = "bg-gray-200";

            if (cell === "#") {
              cellClass = "bg-blue-500";
            }

            if (rowIndex === 0 && colIndex === 1) {
              cellClass = "bg-green-500 animate-pulse";
            } else if (
              rowIndex === mazeLayout.length - 2 &&
              colIndex === (mazeLayout[0]?.length ?? 0) - 2
            ) {
              cellClass = "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient";
            }

            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={`h-8 w-8 ${cellClass}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (rowIndex + colIndex) * 0.01 }}
              />
            );
          })
        )}
      </div>

      {(isGameOver || cooldown) && !hasWon && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.img
            src={Scary.src}
            alt="Scary"
            className="absolute h-screen w-screen object-cover"
            initial={{ scale: 2 }}
            animate={{ scale: 1 }}
          />
          <div className={`${fp.className} text-center relative z-50`}>
            <div className="text-xl text-red-500">Cooldown: {cooldownTime}s</div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {hasWon && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <div className={`${fp.className} text-6xl font-bold text-white`}>
                Level Complete! 🎉
              </div>
              <motion.div 
                className={`${fp.className} mt-4 text-2xl text-white`}
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

export default MazeGame;
