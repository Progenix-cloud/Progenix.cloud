"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import MargeloImage from "public/margelo-logo.svg";
import ArrowDown from "public/arrow-down.webp";
import styles from "styles/modules/landing.module.css";
import {
  companyName,
  taglinePrefixes,
  taglineSuffix,
} from "@/lib/constants/app/landing";

const Landing = () => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [displayText, setDisplayText] = useState(taglinePrefixes[0]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const refContainer = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: refContainer,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const backgroundOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.8, 0.3]
  );

  const handleImageLoaded = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (backgroundRef.current) {
      const rect = backgroundRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaglineIndex((prev) => (prev + 1) % taglinePrefixes.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayText(taglinePrefixes[currentTaglineIndex]);
  }, [currentTaglineIndex]);

  return (
    <div
      className={`${styles.landing__background} min-h-screen flex flex-col justify-center items-center sticky top-0 -z-10 relative overflow-hidden`}
      ref={refContainer}
      onMouseMove={handleMouseMove}
    >
      {/* Enhanced Background with Parallax and Mouse Interaction */}
      <motion.div
        ref={backgroundRef}
        className="absolute inset-0"
        style={{
          y: backgroundY,
          opacity: backgroundOpacity,
        }}
      >
        {/* Background Image with Interactive Effects */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/landing-background.webp')`,
            backgroundPosition: `calc(50% + ${mousePosition.x * 0.01}px) calc(50% + ${mousePosition.y * 0.01}px)`,
            filter: `brightness(${1 + mousePosition.x * 0.0001}) contrast(${1 + mousePosition.y * 0.0001})`,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-pink-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </motion.div>

      <div
        className={`flex-grow-0 transition-opacity duration-1000 pt-10 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="landing__logo">
          <Image
            src={MargeloImage}
            width={128 / 3}
            height={114 / 3}
            alt="margelo logo"
          />
        </div>
      </div>
      <div
        className={`text-white font-bold flex flex-1 flex-col justify-center items-center text-center transition-all duration-1000 drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)] ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="landing__title text-4xl mb-6 lg:text-5xl">
          {companyName}
        </h1>
        <h2 className="landing__subtitle text-2xl tracking-tight mb-2 lg:text-3xl transition-all duration-500">
          {displayText}, {taglineSuffix}.
        </h2>
      </div>
      <div
        className={`flex-grow-0 transition-all duration-1000 pb-10 ${
          imageLoaded ? "opacity-100" : "opacity-0 -translate-y-10"
        }`}
      >
        <div className="landing__arrow">
          <Image
            src={ArrowDown}
            alt="arrow down icon"
            onLoad={handleImageLoaded}
            style={{
              width: "50%",
              height: "50%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
