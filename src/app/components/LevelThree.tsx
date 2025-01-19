/* eslint-disable @typescript-eslint/no-floating-promises */
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Types for game elements
interface Button {
  id: number;
  color: string;
  activeColor: string;
  sound: number;
}

interface Question {
  question: string;
  answers: string[];
  correct: number;
}

// CS interview questions for the evil part of the game
const QUESTIONS: Question[] = [
  {
    question: "What's the time complexity of QuickSort in worst case?",
    answers: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correct: 1
  },
  {
    question: "Which data structure uses LIFO?",
    answers: ["Queue", "Stack", "Heap", "Tree"],
    correct: 1
  },
  {
    question: "What's wrong with this React code:\n\nsetCount(count + 1);\nsetCount(count + 1);",
    answers: ["Increases by 2", "Increases by 1", "Causes error", "Nothing"],
    correct: 1
  },
  {
    question: "Which algorithm is used in finding the shortest path in a graph?",
    answers: ["Dijkstra's Algorithm", "Merge Sort", "Prim's Algorithm", "Binary Search"],
    correct: 0
  },
  {
    question: "What is the time complexity of inserting an element into a Binary Search Tree (BST) in the average case?",
    answers: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct: 1
  },
  {
    question: "In JavaScript, which keyword is used to declare a constant variable?",
    answers: ["var", "let", "const", "static"],
    correct: 2
  },
  {
    question: "Which of the following is NOT a NoSQL database?",
    answers: ["MongoDB", "Redis", "MySQL", "Cassandra"],
    correct: 2
  },
  {
    question: "In Python, what does `len()` function do?",
    answers: ["Returns the length of an iterable", "Sorts a list", "Adds an element to a list", "Deletes an element from a list"],
    correct: 0
  },
  {
    question: "Which design pattern ensures only one instance of a class is created?",
    answers: ["Factory", "Observer", "Singleton", "Decorator"],
    correct: 2
  },
  {
    question: "What is the output of the following code in Python?\n\nprint(type([]))",
    answers: ["<class 'list'>", "<type 'list'>", "<list>", "list"],
    correct: 0
  }
];

// Game buttons configuration
const BUTTONS: Button[] = [
  { id: 0, color: 'bg-red-500', activeColor: 'bg-red-300', sound: 261.63 },    // C4
  { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-300', sound: 329.63 },  // E4
  { id: 2, color: 'bg-green-500', activeColor: 'bg-green-300', sound: 392.00 }, // G4
  { id: 3, color: 'bg-yellow-500', activeColor: 'bg-yellow-300', sound: 466.16 } // B4
];

type GameState = 'idle' | 'countdown' | 'playing' | 'userTurn' | 'question';

export default function SimonGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]); // Add this
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1000);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [shuffledButtons, setShuffledButtons] = useState<Button[]>(BUTTONS);

  const audioContext = useRef<AudioContext>();

  // Initialize audio
  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.AudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (score >= 5) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        router.push('/level/4');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [score, router]);

  // Play button sound
  const playSound = useCallback((frequency: number) => {
    if (!audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    oscillator.start();
    oscillator.stop(audioContext.current.currentTime + 0.3);
  }, []);

  const shuffleButtons = useCallback(() => {
    setShuffledButtons((prevButtons) => {
      const shuffled = [...prevButtons];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i]!; // Assert non-null with !
        shuffled[i] = shuffled[j]!; // Assert non-null with !
        shuffled[j] = temp;
      }
      return shuffled;
    });
  }, []);

  const startRound = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);
  }, []);

  const addToSequence = useCallback(() => {
    const newStep = Math.floor(Math.random() * 4);
    setSequence((prev) => [...prev, newStep]);
  }, []);


  
  const handleButtonClick = useCallback((buttonId: number) => {
    if (gameState !== 'userTurn') return;
  
    const button = BUTTONS[buttonId];
    if (!button) return;
  
    playSound(button.sound);
    setActiveButton(buttonId);
    
    const newUserSequence = [...userSequence, buttonId];
    setUserSequence(newUserSequence);
    
    // Check if the new input is correct
    if (buttonId !== sequence[userSequence.length]) {
      setShowFailure(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return;
    }
    
    // If user completed the sequence correctly
    if (newUserSequence.length === sequence.length) {
      setUserSequence([]); // Reset user sequence
      setGameState('question');
    }
    
    const timer = setTimeout(() => {
      setActiveButton(null);
      shuffleButtons();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [gameState, sequence, userSequence, shuffleButtons, playSound]);

  const handleAnswer = useCallback((answerIndex: number) => {
    const currentQuestionObj = QUESTIONS[currentQuestion];
    if (!currentQuestionObj) return;

    const correct = currentQuestionObj.correct === answerIndex;
    
    if (correct) {
      setScore(prev => {
        const newScore = prev + 1;
        if (newScore >= 5) {
          setShowSuccess(true);
          setTimeout(() => {
            router.push('/level/4');
          }, 2000);
        }
        return newScore;
      });
      setGameSpeed(prev => prev * 0.9);
      setSequence(prev => [...prev, Math.floor(Math.random() * 4)]);
    } else {
      setGameSpeed(prev => prev * 0.8);
      setSequence(prev => [...prev, Math.floor(Math.random() * 4)]);
    }

    setCurrentQuestion(prev => (prev + 1) % QUESTIONS.length);
    startRound();
  }, [currentQuestion, router, startRound]);

  const playSequence = useCallback(async () => {
    setGameState('playing');
    setUserSequence([]); // Reset user sequence at start of playback
    
    for (const buttonId of sequence) {
      const button = BUTTONS[buttonId];
      if (button) {
        setActiveButton(buttonId);
        playSound(button.sound);
        await new Promise(resolve => setTimeout(resolve, gameSpeed * 0.7));
        setActiveButton(null);
        await new Promise(resolve => setTimeout(resolve, gameSpeed * 0.3));
      }
    }
    
    setGameState('userTurn');
  }, [sequence, gameSpeed, playSound]);

  // Countdown effect
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      void playSequence();
    }
  }, [countdown, gameState, playSequence]);

  // Start game effect
  useEffect(() => {
    if (sequence.length === 0) {
      addToSequence();
      startRound();
    }
  }, [sequence.length, addToSequence, startRound]);

  return (
    <div className="relative h-screen w-screen bg-black flex flex-col items-center justify-center">

      <div className="absolute top-4 left-4 text-white">
        <div className="text-2xl font-bold">Score: {score}/5</div>
      </div>

      {/* Score display */}
      <motion.div 
        className="absolute top-8 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Evil Simon Says</h1>
        <p className="text-gray-400 italic">Can you beat the machine?</p>
      </motion.div>

      {/* Countdown */}
      <AnimatePresence>
        {gameState === 'countdown' && (
          <motion.div
            className="absolute text-white text-8xl font-bold"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
          >
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game buttons */}å
      <div className="grid grid-cols-2 gap-4">
      {shuffledButtons.map((button: Button) => (
        <motion.button
          key={button.id}
          onClick={() => handleButtonClick(button.id)}
          className={`w-32 h-32 rounded-lg transition-all duration-200
            ${activeButton === button.id ? button.activeColor : button.color}`}
          animate={{
            scale: activeButton === button.id ? 1.1 : 1,
            opacity: gameState === 'playing' ? 
              (activeButton === button.id ? 1 : 0.5) : 1
          }}
          transition={{
            scale: { type: "spring", stiffness: 300, damping: 15 },
            opacity: { duration: 0.2 }
          }}
        />
      ))}
      </div>

      {/* Question modal */}
      <AnimatePresence>
  {gameState === 'question' && (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg p-6 max-w-2xl w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <pre className="bg-gray-100 p-4 rounded mb-4 whitespace-pre-wrap">
          {QUESTIONS[currentQuestion]?.question ?? 'Loading question...'}
        </pre>
        <div className="grid gap-2">
          {QUESTIONS[currentQuestion]?.answers.map((answer, index) => (
            <motion.button
              key={index}
              className="p-3 rounded bg-blue-500 text-white hover:bg-blue-600
                transition-colors text-left"
              onClick={() => handleAnswer(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {answer}
            </motion.button>
          ))?? []}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
        {showFailure && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-90 z-50"
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
              <div className="text-6xl font-bold text-white mb-6">
                Wrong Sequence! 😔
              </div>
              <motion.div
                className="text-3xl text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Try Again...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
  {showSuccess && (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-6xl font-bold text-white text-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 10 }}
      >
        <div>Level Complete! 🎉</div>
        <motion.div
          className="text-2xl mt-4"
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
}
