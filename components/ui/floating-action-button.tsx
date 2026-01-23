"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRocket, FaEnvelope, FaPhone, FaGithub, FaLinkedin } from "react-icons/fa";

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: FaEnvelope,
      label: "Email",
      href: "mailto:contact@yourcompany.com",
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: FaPhone,
      label: "Call",
      href: "tel:+1234567890",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: FaGithub,
      label: "GitHub",
      href: "https://github.com/yourcompany",
      color: "bg-gray-800 hover:bg-gray-900",
    },
    {
      icon: FaLinkedin,
      label: "LinkedIn",
      href: "https://linkedin.com/company/yourcompany",
      color: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3"
          >
            {menuItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { delay: index * 0.1 }
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                  scale: 0.8,
                  transition: { delay: (menuItems.length - index - 1) * 0.05 }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:shadow-xl group relative`}
              >
                <item.icon className="w-5 h-5" />
                <div className="absolute right-full mr-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500"
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Rocket icon with rotation */}
        <motion.div
          animate={{
            rotate: isOpen ? 45 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <FaRocket className="w-6 h-6" />
        </motion.div>

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;