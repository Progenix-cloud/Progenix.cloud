"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scale" | "rotate";
  delay?: number;
  duration?: number;
  className?: string;
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = "fadeIn",
  delay = 0,
  duration = 0.6,
  className = "",
}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: "easeOut" as const,
        },
      },
    };

    switch (animation) {
      case "slideUp":
        return {
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration, delay, ease: "easeOut" as const },
          },
        };
      case "slideLeft":
        return {
          hidden: { opacity: 0, x: 50 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay, ease: "easeOut" as const },
          },
        };
      case "slideRight":
        return {
          hidden: { opacity: 0, x: -50 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay, ease: "easeOut" as const },
          },
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { duration, delay, ease: "easeOut" as const },
          },
        };
      case "rotate":
        return {
          hidden: { opacity: 0, rotate: -10, scale: 0.9 },
          visible: {
            opacity: 1,
            rotate: 0,
            scale: 1,
            transition: { duration, delay, ease: "easeOut" as const },
          },
        };
      default:
        return baseVariants;
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={getAnimationVariants()}
    >
      {children}
    </motion.div>
  );
};

// Pre-built animation components
export const FadeIn: React.FC<Omit<ScrollAnimationProps, "animation">> = (props) => (
  <ScrollAnimation {...props} animation="fadeIn" />
);

export const SlideUp: React.FC<Omit<ScrollAnimationProps, "animation">> = (props) => (
  <ScrollAnimation {...props} animation="slideUp" />
);

export const SlideLeft: React.FC<Omit<ScrollAnimationProps, "animation">> = (props) => (
  <ScrollAnimation {...props} animation="slideLeft" />
);

export const SlideRight: React.FC<Omit<ScrollAnimationProps, "animation">> = (props) => (
  <ScrollAnimation {...props} animation="slideRight" />
);

export const ScaleIn: React.FC<Omit<ScrollAnimationProps, "animation">> = (props) => (
  <ScrollAnimation {...props} animation="scale" />
);

export const RotateIn: React.FC<Omit<ScrollAnimationProps, "animation">> = (props) => (
  <ScrollAnimation {...props} animation="rotate" />
);

export default ScrollAnimation;