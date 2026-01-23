"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useRef } from "react";

interface Skill {
  name: string;
  level: number;
  color: string;
  icon?: string;
  currentLevel?: number;
}

const skills: Skill[] = [
  { name: "React/Next.js", level: 95, color: "from-blue-500 to-cyan-500" },
  { name: "TypeScript", level: 90, color: "from-blue-600 to-blue-800" },
  { name: "Node.js", level: 85, color: "from-green-500 to-green-700" },
  { name: "Python", level: 80, color: "from-yellow-500 to-orange-500" },
  { name: "AWS/Azure", level: 75, color: "from-purple-500 to-pink-500" },
  { name: "DevOps", level: 70, color: "from-red-500 to-red-700" },
  { name: "UI/UX Design", level: 85, color: "from-indigo-500 to-purple-500" },
  { name: "Database Design", level: 80, color: "from-teal-500 to-blue-500" },
];

const EnhancedSkillsProgress = () => {
  const [animatedSkills, setAnimatedSkills] = useState<Skill[]>(skills.map(skill => ({ ...skill, currentLevel: 0 })));
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");

      // Animate progress bars
      const timer = setTimeout(() => {
        setAnimatedSkills(skills.map(skill => ({ ...skill, currentLevel: skill.level })));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section ref={ref} className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-900 py-20">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Our Technical Expertise
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We combine cutting-edge technologies with deep industry knowledge to deliver exceptional results
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {animatedSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-200 dark:border-gray-700 group"
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                rotateY: 2,
                z: 20
              }}
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
            >
              {/* Skill Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${skill.color} animate-pulse`}></div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {skill.name}
                  </h4>
                </div>
                <motion.span
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1, type: "spring" }}
                >
                  {skill.currentLevel}%
                </motion.span>
              </div>

              {/* Progress Bar Container */}
              <div className="relative mb-4">
                {/* Background Bar */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  {/* Animated Progress Bar */}
                  <motion.div
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full relative overflow-hidden`}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.currentLevel}%` }}
                    transition={{
                      duration: 2,
                      delay: 0.5 + index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    {/* Shimmer Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "linear",
                      }}
                    />

                    {/* Particles */}
                    <motion.div
                      className="absolute top-0 right-0 w-2 h-full bg-white/60 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                </div>

                {/* Level Markers */}
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                  <span>Expert</span>
                </div>
              </div>

              {/* Skill Description */}
              <motion.div
                className="text-sm text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 + index * 0.1 }}
              >
                {(skill.currentLevel ?? 0) >= 90 && "Master-level proficiency with extensive experience"}
                {(skill.currentLevel ?? 0) >= 80 && (skill.currentLevel ?? 0) < 90 && "Strong expertise with proven track record"}
                {(skill.currentLevel ?? 0) >= 70 && (skill.currentLevel ?? 0) < 80 && "Solid foundation with growing experience"}
                {(skill.currentLevel ?? 0) < 70 && "Developing skills with promising potential"}
              </motion.div>

              {/* Hover Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10"
                animate={{
                  scale: isInView ? 1 : 0.8,
                }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 2, duration: 0.8 }}
        >
          {[
            { label: "Years Experience", value: "5+", icon: "🎯" },
            { label: "Projects Completed", value: "200+", icon: "🚀" },
            { label: "Happy Clients", value: "50+", icon: "😊" },
            { label: "Technologies", value: "15+", icon: "⚡" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg border border-gray-200 dark:border-gray-700"
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                z: 10
              }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-emerald-600 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedSkillsProgress;