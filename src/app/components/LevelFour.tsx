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

const generateMaze = (rows: number, cols: number): string[][] => {
  // Initialize the maze with walls
  const maze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "#"),
  );

  // Stack for backtracking
  const stack: Position[] = [];
  const directions = [
    { x: 0, y: 2 }, // Right
    { x: 2, y: 0 }, // Down
    { x: 0, y: -2 }, // Left
    { x: -2, y: 0 }, // Up
  ];

  // Entrance and exit positions
  const startX = 1;
  const startY = 1;
  const endX = rows - 2;
  const endY = cols - 2;

  // Check if a cell is within bounds and surrounded by walls
  const isValidMove = (x: number, y: number): boolean => {
    return (
      x > 0 &&
      y > 0 &&
      x < rows - 1 &&
      y < cols - 1 &&
      maze[x]?.[y] !== undefined &&
      maze[x][y] === "#"
    );
  };

  stack.push({ x: startX, y: startY });

  // Mark a cell as visited and carve it
  const carvePath = (x: number, y: number) => {
    if (maze[x]?.[y] !== undefined) {
      maze[x][y] = " ";
    }
  };

  // Create entrance and make it wider
  carvePath(startX - 1, startY);
  carvePath(startX + 1, startY);
  carvePath(startX, startY - 1);
  carvePath(startX + 1, startY - 1);
  carvePath(startX - 1, startY - 1);

  // Create exit and make sure it is accessible
  carvePath(endX, endY);
  carvePath(endX, endY - 1);
  carvePath(endX - 1, endY);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const x = current?.x;
    const y = current?.y;

    // Shuffle directions to create randomness
    const shuffledDirections = directions.sort(() => Math.random() - 0.5);

    let carved = false;
    for (const dir of shuffledDirections) {
      const newX = x! + dir.x;
      const newY = y! + dir.y;
      const wallX = x! + dir.x / 2;
      const wallY = y! + dir.y / 2;

      if (isValidMove(newX, newY)) {
        carvePath(newX, newY);
        carvePath(wallX, wallY); // Remove the wall between cells
        stack.push({ x: newX, y: newY });
        carved = true;
        break;
      }
    }

    // Backtrack if no moves are possible
    if (!carved) {
      stack.pop();
    }
  }

  return maze;
};

const MazeGame = () => {
  const [mazeLayout, setMazeLayout] = useState<string[][]>(
    generateMaze(20, 20),
  );
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<boolean>(false);
  const [cooldownTime, setCooldownTime] = useState<number>(5);

  const router = useRouter();

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
      if (mazeLayout?.[y]?.[x] !== undefined) {
        if (
          mazeLayout[y][x] === " " ||
          (y === (mazeLayout.length ?? 0) - 2 &&
            x === (mazeLayout[0]?.length ?? 0) - 2)
        ) {
          if (
            y === (mazeLayout.length ?? 0) - 2 &&
            x === (mazeLayout[0]?.length ?? 0) - 2
          ) {
            setHasWon(true);
            const timer = setTimeout(() => {
              router.push("/level/5");
            }, 2000);
            return () => clearTimeout(timer);
          }
        } else if (mazeLayout[y][x] === "#" && gameStarted) {
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
      audio.play().catch((error) => console.log("Audio play failed:", error));
      setAudioPlayed(true);

      // Reset after 5 seconds
      setTimeout(() => {
        resetGame();
      }, 5000);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black bg-gradient-to-b">
      <div className={`${fp.className} mb-8 text-center text-2xl text-white`}>
        Enter through the green...
        <br />
        <span className="text-red-500">and hope you aren&apos;t seen</span>
      </div>
      <span className={`${fp.className} mb-2 text-green-500`}>
        {gameStarted ? "Go!" : "Click on the green zone to start"}
      </span>
      {gameStarted && !isGameOver && !hasWon && (
        <motion.div
          className="absolute left-4 top-4 rounded-lg bg-gray-800 p-4 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span
            className={`${fp.className} ${timer < 10 ? "text-red-500" : "text-white"} text-xl`}
          >
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
          gridTemplateRows: `repeat(${mazeLayout.length}, 30px)`,
        }}
      >
        {mazeLayout.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let cellClass = "bg-gray-200";

            if (cell === "#") {
              cellClass = "bg-blue-500";
            }

            // Special styling for entrance and exit
            if (rowIndex <= 1 && colIndex >= 0 && colIndex <= 2) {
              cellClass = "bg-green-500 animate-pulse cursor-pointer";
            } else if (
              rowIndex === mazeLayout.length - 2 &&
              colIndex === (mazeLayout[0]?.length ?? 0) - 2
            ) {
              cellClass =
                "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient";
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
          }),
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
          <div className={`${fp.className} relative z-50 text-center`}>
            <div className="text-xl text-red-500">
              Cooldown: {cooldownTime}s
            </div>
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
