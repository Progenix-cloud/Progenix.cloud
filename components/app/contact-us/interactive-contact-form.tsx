"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaCheck, FaTimes, FaUser, FaEnvelope, FaComment } from "react-icons/fa";

const InteractiveContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", message: "" });
    setSubmitStatus("idle");
  };

  const inputVariants = {
    focused: { scale: 1.02, borderColor: "#06b6d4" },
    unfocused: { scale: 1, borderColor: "#e5e7eb" },
  };

  const labelVariants = {
    focused: { y: -25, scale: 0.85, color: "#06b6d4" },
    unfocused: { y: 0, scale: 1, color: "#6b7280" },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Let&apos;s Build Something Amazing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Ready to transform your ideas into reality? We&apos;d love to hear from you.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitStatus === "idle" && (
              <motion.form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Name Field */}
                <div className="mb-6 relative">
                  <motion.div
                    className="relative"
                    animate={focusedField === "name" || formData.name ? "focused" : "unfocused"}
                    variants={inputVariants}
                  >
                    <motion.label
                      className="absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none"
                      variants={labelVariants}
                      transition={{ duration: 0.2 }}
                    >
                      Full Name
                    </motion.label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pt-6 pb-3 px-4 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none text-gray-900 dark:text-white transition-colors duration-300"
                      required
                    />
                    <FaUser className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </motion.div>
                </div>

                {/* Email Field */}
                <div className="mb-6 relative">
                  <motion.div
                    className="relative"
                    animate={focusedField === "email" || formData.email ? "focused" : "unfocused"}
                    variants={inputVariants}
                  >
                    <motion.label
                      className="absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none"
                      variants={labelVariants}
                      transition={{ duration: 0.2 }}
                    >
                      Email Address
                    </motion.label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pt-6 pb-3 px-4 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none text-gray-900 dark:text-white transition-colors duration-300"
                      required
                    />
                    <FaEnvelope className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </motion.div>
                </div>

                {/* Message Field */}
                <div className="mb-8 relative">
                  <motion.div
                    className="relative"
                    animate={focusedField === "message" || formData.message ? "focused" : "unfocused"}
                    variants={inputVariants}
                  >
                    <motion.label
                      className="absolute left-4 top-4 text-gray-500 dark:text-gray-400 pointer-events-none"
                      variants={labelVariants}
                      transition={{ duration: 0.2 }}
                    >
                      Your Message
                    </motion.label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      rows={5}
                      className="w-full pt-6 pb-3 px-4 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none text-gray-900 dark:text-white transition-colors duration-300 resize-none"
                      required
                    />
                    <FaComment className="absolute right-4 top-6 text-gray-400 w-5 h-5" />
                  </motion.div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {submitStatus === "success" && (
              <motion.div
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FaCheck className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-6">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={resetForm}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                >
                  Send Another Message
                </button>
              </motion.div>
            )}

            {submitStatus === "error" && (
              <motion.div
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FaTimes className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-2">
                  Oops! Something went wrong.
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-6">
                  Please try again or contact us directly.
                </p>
                <button
                  onClick={resetForm}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default InteractiveContactForm;