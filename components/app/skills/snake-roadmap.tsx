"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RoadmapCard from "./roadmap-card";
import { roadmap } from "@/lib/constants/app/roadmap";

const SnakeRoadmap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const pathProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const unsubscribe = pathProgress.onChange((progress) => {
      const index = Math.floor(progress * roadmap.length);
      setActiveIndex(Math.min(index, roadmap.length - 1));
    });

    return unsubscribe;
  }, [pathProgress]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-20 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Our Development Roadmap
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A strategic approach to transforming your vision into reality
          </p>
        </div>

        {/* Roadmap Cards Container */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {roadmap.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={item.title}
                className="flex-shrink-0"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100,
                }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  z: 20,
                }}
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d",
                }}
              >
                <RoadmapCard
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  isActive={isActive}
                  index={index}
                />

                {/* Connection Line */}
                {index < roadmap.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: index * 0.2 + 0.4, duration: 0.8 }}
                    viewport={{ once: true }}
                  />
                )}

                {/* Mobile Connection Arrow */}
                {index < roadmap.length - 1 && (
                  <motion.div
                    className="lg:hidden flex justify-center mt-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.6 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="w-8 h-8 border-r-2 border-b-2 border-emerald-400 transform rotate-45"
                      animate={{
                        y: [0, 5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Indicators */}
        <motion.div
          className="flex justify-center mt-12 space-x-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          viewport={{ once: true }}
        >
          {roadmap.map((_, index) => (
            <motion.button
              key={index}
              className={`relative w-4 h-4 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              onClick={() => setActiveIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                scale: index === activeIndex ? 1.3 : 1,
              }}
            >
              {index === activeIndex && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 0.3, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Current Step Info */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {activeIndex + 1} of {roadmap.length}:{" "}
              {roadmap[activeIndex]?.title}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SnakeRoadmap;
