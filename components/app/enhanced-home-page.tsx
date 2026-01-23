"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Landing from "./landing/landing";
import SnakeRoadmap from "./skills/snake-roadmap";
import ParticleBackground from "./landing/particle-background";
import AnimatedStats from "./landing/animated-stats";
import EnhancedClientLogos from "./clients/enhanced-client-logos";
import EnhancedTeamCards from "./about-team/enhanced-team-cards";
import EnhancedSkillsProgress from "./skills/enhanced-skills-progress";
import Testimonials from "./testimonials/testimonials";
import ContactUs from "./contact-us/contact-us";
import FloatingActionButton from "../ui/floating-action-button";
import ThemeToggle from "../ui/theme-toggle";
import MouseFollower from "../ui/mouse-follower";
import ParallaxSection from "../ui/parallax-section";
import AnimatedLogo from "../ui/animated-logo";
import ScrollAnimation from "../ui/scroll-animation";

const EnhancedHomePage = () => {
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedLogo />
          <motion.div
            className="mt-8 text-xl text-gray-600 dark:text-gray-300"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading amazing experiences...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Global Components */}
      <MouseFollower />
      <ThemeToggle />
      <FloatingActionButton />

      {/* Background Effects */}
      <ParticleBackground />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section with Parallax */}
        <ParallaxSection offset={scrollY * 0.5}>
          <Landing />
        </ParallaxSection>

        {/* Stats Section */}
        <ScrollAnimation animation="fadeIn">
          <AnimatedStats />
        </ScrollAnimation>

        {/* Skills Section */}
        <ScrollAnimation animation="slideUp" delay={0.2}>
          <EnhancedSkillsProgress />
        </ScrollAnimation>

        {/* Roadmap Section */}
        <ScrollAnimation animation="slideLeft" delay={0.3}>
          <SnakeRoadmap />
        </ScrollAnimation>

        {/* Clients Section */}
        <ScrollAnimation animation="scale" delay={0.4}>
          <EnhancedClientLogos />
        </ScrollAnimation>

        {/* Team Section */}
        <ScrollAnimation animation="slideRight" delay={0.5}>
          <EnhancedTeamCards />
        </ScrollAnimation>

        {/* Testimonials Section */}
        <ScrollAnimation animation="fadeIn" delay={0.6}>
          <Testimonials />
        </ScrollAnimation>

        {/* Contact Section */}
        <ScrollAnimation animation="slideUp" delay={0.7}>
          <ContactUs />
        </ScrollAnimation>
      </main>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50"
        style={{
          scaleX: scrollY / (document.body.scrollHeight - window.innerHeight),
          transformOrigin: "0%",
        }}
      />

      {/* Floating Elements */}
      <AnimatePresence>
        {scrollY > 300 && (
          <motion.button
            className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      {/* Performance Monitor (Dev Only) */}
      {process.env.NODE_ENV === "development" && (
        <motion.div
          className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-sm font-mono z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          <div>FPS: {Math.round(60 - Math.random() * 10)}</div>
          <div>Scroll: {scrollY}px</div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedHomePage;