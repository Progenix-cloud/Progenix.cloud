"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaQuoteLeft,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";
import { reviews } from "@/lib/constants/app/testimonials";

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Don&apos;t just take our word for it - hear from the companies
            we&apos;ve helped transform
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Carousel */}
          <div className="relative h-96 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {reviews.map((review, index) => {
                const isActive = index === currentIndex;
                const isPrev =
                  index ===
                  (currentIndex - 1 + reviews.length) % reviews.length;
                const isNext = index === (currentIndex + 1) % reviews.length;

                let zIndex = 0;
                let scale = 0.8;
                let opacity = 0.3;
                let rotateY = 0;

                if (isActive) {
                  zIndex = 10;
                  scale = 1;
                  opacity = 1;
                } else if (isPrev) {
                  zIndex = 5;
                  scale = 0.9;
                  opacity = 0.7;
                  rotateY = -15;
                } else if (isNext) {
                  zIndex = 5;
                  scale = 0.9;
                  opacity = 0.7;
                  rotateY = 15;
                }

                return (
                  <motion.div
                    key={`${review.by}-${index}`}
                    className={`absolute inset-0 flex items-center justify-center`}
                    style={{ zIndex }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity,
                      scale,
                      rotateY,
                      x: isPrev ? -100 : isNext ? 100 : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.5,
                    }}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl mx-4 border border-gray-200 dark:border-gray-700">
                      {/* Quote Icon */}
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <FaQuoteLeft className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex justify-center mb-6">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <FaStar className="w-5 h-5 text-yellow-400 mx-1" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Testimonial Text */}
                      <blockquote className="text-lg text-gray-700 dark:text-gray-300 text-center mb-6 leading-relaxed">
                        &ldquo;{review.text}&rdquo;
                      </blockquote>

                      {/* Author */}
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">
                          {review.by}
                        </p>
                      </div>

                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
                      <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl z-20"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl z-20"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-3">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 w-8"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
