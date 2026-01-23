"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCode, FaRocket, FaMagic, FaStar } from "react-icons/fa";

const AnimatedLogo = () => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const icons = [
    { icon: FaCode, color: "text-blue-500", bgColor: "bg-blue-500" },
    { icon: FaRocket, color: "text-purple-500", bgColor: "bg-purple-500" },
    { icon: FaMagic, color: "text-pink-500", bgColor: "bg-pink-500" },
    { icon: FaStar, color: "text-yellow-500", bgColor: "bg-yellow-500" },
  ];

  useEffect(() => {
    if (isHovered) return; // Pause rotation on hover

    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isHovered, icons.length]);

  const CurrentIcon = icons[currentIcon].icon;

  return (
    <motion.div
      className="relative w-16 h-16 cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background glow */}
      <motion.div
        className={`absolute inset-0 rounded-full ${icons[currentIcon].bgColor} opacity-20 blur-xl`}
        animate={{
          scale: isHovered ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Main icon container */}
      <motion.div
        className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center shadow-lg border border-gray-200 dark:border-gray-600"
        animate={{
          rotate: isHovered ? [0, -10, 10, 0] : 0,
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIcon}
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
            className={`text-2xl ${icons[currentIcon].color}`}
          >
            <CurrentIcon />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Floating particles */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${icons[currentIcon].bgColor} rounded-full`}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: Math.cos((i * 60 * Math.PI) / 180) * 40,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 40,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                exit={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Morphing border */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          background: `conic-gradient(from 0deg, ${icons[currentIcon].bgColor.replace('bg-', '').replace('500', '')}500, transparent, transparent, ${icons[currentIcon].bgColor.replace('bg-', '').replace('500', '')}500)`,
          borderRadius: '50%',
        }}
        animate={{
          rotate: isHovered ? 360 : 0,
        }}
        transition={{
          duration: 3,
          repeat: isHovered ? Infinity : 0,
          ease: "linear",
        }}
      />

      {/* Pulse effect */}
      <motion.div
        className={`absolute inset-0 rounded-full ${icons[currentIcon].bgColor} opacity-30`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default AnimatedLogo;