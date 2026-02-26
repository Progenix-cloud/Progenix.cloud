"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { clients } from "@/lib/constants/app/clients";

const EnhancedClientLogos = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex flex-col justify-center items-center py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trusted by Industry Leaders
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We&apos;ve had the privilege of working with amazing companies and
            delivering exceptional results
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {clients.map((client, index) => (
            <motion.div
              key={client.name}
              className="relative group cursor-pointer"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={client.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 h-32 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {/* Logo Image */}
                  <motion.div
                    className="relative w-full h-full flex items-center justify-center"
                    animate={{
                      scale: hoveredIndex === index ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={`/logos/${client.logo}`}
                      alt={`${client.name} logo`}
                      fill
                      className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-500 drop-shadow-sm group-hover:drop-shadow-lg"
                      style={{
                        filter:
                          hoveredIndex === index
                            ? "none"
                            : "grayscale(30%) brightness(0.9)",
                      }}
                    />
                  </motion.div>

                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={{
                      opacity: hoveredIndex === index ? 1 : 0,
                    }}
                  />

                  {/* Floating particles on hover */}
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-blue-400 rounded-full"
                            initial={{
                              x: "50%",
                              y: "50%",
                              opacity: 0,
                              scale: 0,
                            }}
                            animate={{
                              x: `${50 + Math.cos((i * 72 * Math.PI) / 180) * 40}%`,
                              y: `${50 + Math.sin((i * 72 * Math.PI) / 180) * 40}%`,
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                            }}
                            exit={{
                              x: "50%",
                              y: "50%",
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

                  {/* Tooltip */}
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
                    initial={false}
                    animate={{
                      y: hoveredIndex === index ? 0 : 5,
                      opacity: hoveredIndex === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {client.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </motion.div>
                </div>
              </Link>

              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"
                animate={{
                  scale: hoveredIndex === index ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300">
                Projects Completed
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-300">
                Happy Clients
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-pink-600 mb-2">5+</div>
              <div className="text-gray-600 dark:text-gray-300">
                Years Experience
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedClientLogos;
