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

type Position = {
  x: number;
  y: number;
};

type Direction = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

const generateMaze = (rows: number, cols: number): string[][] => {
  // Initialize the maze with walls
  const maze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "#")
  );

  // Helper function to check if a cell is within bounds
  const isValid = (x: number, y: number): boolean => 
    x > 0 && x < rows - 1 && y > 0 && y < cols - 1;

  // Stack for backtracking
  const stack: Position[] = [];
  const startX = 1;
  const startY = 1;

  // Mark start cell as visited
  maze[startX][startY] = " ";
  stack.push({ x: startX, y: startY });

  // Directions: right, down, left, up
  const directions: [number, number][] = [
    [0, 2],
    [2, 0],
    [0, -2],
    [-2, 0]
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1]!;
    if (!current) continue;
    
    // Get unvisited neighbors
    const unvisitedNeighbors = directions
      .map(([dx, dy]) => ({
        x: current.x + dx,
        y: current.y + dy,
        dx,
        dy
      }))
      .filter(({ x, y }) => isValid(x, y) && maze[x][y] === "#");

    if (unvisitedNeighbors.length > 0) {
      // Randomly choose a neighbor
      const { x, y, dx, dy } = unvisitedNeighbors[
        Math.floor(Math.random() * unvisitedNeighbors.length)
      ];
      
      // Carve a path
      maze[x][y] = " ";
      maze[current.x + dx/2][current.y + dy/2] = " ";
      stack.push({ x, y });
    } else {
      stack.pop();
    }
  }

  // Set entrance and exit
  // Make the entrance wider by setting more cells as paths
  maze[0][0] = " ";  // Entrance left
  maze[0][1] = " ";  // Entrance center
  maze[0][2] = " ";  // Entrance right
  maze[1][0] = " ";  // Path below entrance left
  maze[1][1] = " ";  // Path below entrance center
  maze[1][2] = " ";  // Path below entrance right
  
  maze[rows - 2][cols - 2] = " ";  // Exit
  maze[rows - 2][cols - 3] = " ";  // Path to exit
  maze[rows - 3][cols - 2] = " ";  // Additional path near exit

  return maze;
};

const MazeGame = () => {
  const [mazeLayout, setMazeLayout] = useState<string[][]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<boolean>(false);
  const [cooldownTime, setCooldownTime] = useState<number>(5);
  const specialPoint: Position = { x: 5, y: 5 };

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
    if (!gameStarted) return; // Don't process mouse movement if game hasn't started

    const mazeElement = document.getElementById("maze");
    if (mazeElement) {
      const bounds = mazeElement.getBoundingClientRect();
      const x = Math.floor((e.clientX - bounds.left) / 30);
      const y = Math.floor((e.clientY - bounds.top) / 30);

      // Check if position is within maze bounds
      if (y >= 0 && y < mazeLayout.length && x >= 0 && x < mazeLayout[0]?.length) {
        if (mazeLayout[y][x] === " " || 
            (y === mazeLayout.length - 2 && x === mazeLayout[0].length - 2)) {

          // Win condition
          if (y === mazeLayout.length - 2 && x === mazeLayout[0].length - 2) {
            setHasWon(true);
            const timer = setTimeout(() => {
              router.push('/level/5');
            }, 2000);
            return () => clearTimeout(timer);
          }
        } else if (mazeLayout[y][x] === "#") {
          setIsGameOver(true);
        }
      }
    }
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    // Start game when clicking any of the green entrance tiles
    if (!gameStarted && rowIndex <= 1 && colIndex >= 0 && colIndex <= 2) {
      setGameStarted(true);
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
      
      // Reset after 5 seconds
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
      <span className={`${fp.className} text-green-500 mb-2`}>{gameStarted ? "Go!" : "Click on the green zone to start"}</span>
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
          gridTemplateColumns: `repeat(${mazeLayout[0]?.length}, 30px)`,
          gridTemplateRows: `repeat(${mazeLayout.length}, 30px)`
        }}
      >
        {mazeLayout.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let cellClass = "bg-gray-200";

            if (cell === "#") {
              cellClass = "bg-blue-500";
            }

            // Special styling for entrance and exit
            if ((rowIndex <= 1 && colIndex >= 0 && colIndex <= 2)) {
              cellClass = "bg-green-500 animate-pulse cursor-pointer";
            } else if (
              rowIndex === mazeLayout.length - 2 &&
              colIndex === mazeLayout[0]?.length - 2
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
                onClick={() => handleCellClick(rowIndex, colIndex)}
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