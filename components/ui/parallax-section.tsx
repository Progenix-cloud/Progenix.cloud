"use client";

import { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: ReactNode;
  offset?: number;
}

const ParallaxSection = ({ children, offset = 0 }: ParallaxSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, offset]);

  return (
    <motion.div
      ref={containerRef}
      style={{ y: parallaxY }}
      className="relative"
    >
      {children}
    </motion.div>
  );
};

export default ParallaxSection;