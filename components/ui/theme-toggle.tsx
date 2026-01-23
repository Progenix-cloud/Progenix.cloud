"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        newTheme === "dark" ? "#1f2937" : "#ffffff"
      );
    }
  };

  const toggleTheme = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);

    // Reset animation state
    setTimeout(() => setIsAnimating(false), 2000);
  };

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <>
      <motion.button
        onClick={toggleTheme}
        disabled={isAnimating}
        className="fixed top-8 right-8 z-40 w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          animate={{ rotate: theme === "dark" ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {theme === "light" ? (
            <FaSun className="w-5 h-5 text-yellow-400" />
          ) : (
            <FaMoon className="w-5 h-5 text-blue-300" />
          )}
        </motion.div>

        {/* Tooltip */}
        <div className="absolute top-full mt-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
        </div>
      </motion.button>

      {/* Water Wave Splash Effect */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Multiple wave circles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-8 right-8 border-2 border-blue-400 rounded-full"
                initial={{
                  width: 48,
                  height: 48,
                  opacity: 0.8,
                  scale: 1,
                }}
                animate={{
                  width: 200 + i * 50,
                  height: 200 + i * 50,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                style={{
                  background: `radial-gradient(circle, ${
                    theme === "light"
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(147, 197, 253, 0.1)"
                  } 0%, transparent 70%)`,
                }}
              />
            ))}

            {/* Ripple particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                initial={{
                  x: 24,
                  y: 24,
                  opacity: 0.8,
                  scale: 1,
                }}
                animate={{
                  x: Math.cos((i * 30 * Math.PI) / 180) * 100,
                  y: Math.sin((i * 30 * Math.PI) / 180) * 100,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1.2,
                  delay: 0.2 + i * 0.05,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeToggle;