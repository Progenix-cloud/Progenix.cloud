"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MouseFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    document.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Main cursor follower */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          scale: { duration: 0.2 }
        }}
      />

      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border-2 border-cyan-400/50 rounded-full pointer-events-none z-40"
        animate={{
          x: mousePosition.x - 24,
          y: mousePosition.y - 24,
          scale: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          scale: { duration: 0.3 }
        }}
      />

      {/* Trailing particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed top-0 left-0 w-2 h-2 bg-purple-400/60 rounded-full pointer-events-none z-30"
          animate={{
            x: mousePosition.x - 4,
            y: mousePosition.y - 4,
            scale: isVisible ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: i * 0.1,
            scale: { duration: 0.4 + i * 0.1 }
          }}
        />
      ))}

      {/* Click ripple effect */}
      <motion.div
        className="fixed top-0 left-0 w-20 h-20 border border-cyan-300/30 rounded-full pointer-events-none z-20"
        animate={{
          x: mousePosition.x - 40,
          y: mousePosition.y - 40,
          scale: [0, 1.5, 0],
          opacity: [0.5, 0, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
    </>
  );
};

export default MouseFollower;