"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  cartoonImage: string;
  skills: string[];
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: "Aniruddha Singh",
    role: "Business Head ",
    bio: " Experienced leader driving business growth and client success in the software industry.",
    image: "/team/anirudh.png",
    cartoonImage: "/team/catalin-face.svg",
    skills: ["Leadership", "Client Relations", "Strategic Planning", "Business Development"],
    social: {
      github: "https://github.com/sarahchen",
      linkedin: "https://linkedin.com/in/sarahchen",
      twitter: "https://twitter.com/sarahchen",
      email: "sarah@agency.com"
    }
  },
  {
    name: "Sujal Srivastava",
    role: "Lead Architect",
    bio: "Visionary software architect specializing in scalable and maintainable system designs.",
    image: "/team/sujal.png",
    cartoonImage: "/team/christoph-face.svg",
    skills: ["System Design", "Microservices", "Cloud Architecture", "Performance Optimization"],
    social: {
      linkedin: "https://linkedin.com/in/marcusrodriguez",
      twitter: "https://twitter.com/marcusrodriguez",
      email: "marcus@agency.com"
    }
  },
  {
    name: "Kunal Pratap Singh",
    role: "Project Manager",
    bio: "Agile project manager ensuring timely delivery and client satisfaction.",
    image: "/team/kunal.png",
    cartoonImage: "/team/eric-face.svg",
    skills: ["Docker", "Kubernetes", "CI/CD", "Azure"],
    social: {
      github: "https://github.com/alexthompson",
      linkedin: "https://linkedin.com/in/alexthompson",
      email: "alex@agency.com"
    }
  },
  {
    name: "Raghav Naithini",
    role: "Backend Lead",
    bio: "Skilled backend developer focused on building robust APIs and services.",
    image: "/team/raghav.png",
    cartoonImage: "/team/marc-face.svg",
    skills: ["Node.js", "Express", "Database Design", "API Development"],
    social: {
      linkedin: "https://linkedin.com/in/emilydavis",
      email: "emily@agency.com"
    }
  },
  {
    name: "Devansh Gaur",
    role: "Frontend Lead",
    bio: "Passionate frontend developer crafting engaging user experiences.",
    image: "/team/devansh.png",
    cartoonImage: "/team/matei-face.svg",
    skills: ["React", "Vue.js", "UI/UX Design", "Performance Tuning"],
    social: {
      linkedin: "https://linkedin.com/in/emilydavis",
      email: "emily@agency.com"
    }
  }
];

const EnhancedTeamCards = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Meet Our Expert Team
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Passionate professionals dedicated to delivering exceptional digital experiences
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="relative group cursor-pointer"
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => setSelectedMember(member)}
              whileHover={{
                rotateY: 10,
                rotateX: 5,
                scale: 1.05,
                z: 50
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-600">
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  {/* Cartoon Image (Default) */}
                  <motion.div
                    className="absolute inset-0 w-full h-full"
                    animate={{
                      scale: hoveredCard === index ? 0.9 : 1,
                      opacity: hoveredCard === index ? 0 : 1,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <Image
                      src={member.cartoonImage}
                      alt={`${member.name} cartoon`}
                      fill
                      className="object-cover rounded-t-2xl"
                      onError={(e) => {
                        // Fallback to a cute placeholder if cartoon image doesn't exist
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml;base64,${btoa(`
                          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="90" fill="#${['FF6B6B','4ECDC4','45B7D1','96CEB4','FFEAA7','DDA0DD','98D8C8'][index % 7]}" />
                            <circle cx="80" cy="85" r="8" fill="white" />
                            <circle cx="120" cy="85" r="8" fill="white" />
                            <circle cx="80" cy="85" r="4" fill="black" />
                            <circle cx="120" cy="85" r="4" fill="black" />
                            <path d="M85 115 Q100 125 115 115" stroke="black" stroke-width="3" fill="none" stroke-linecap="round" />
                            <circle cx="100" cy="140" r="15" fill="#FF6B6B" />
                          </svg>
                        `)}`;
                      }}
                    />
                  </motion.div>

                  {/* Real Image (On Hover) */}
                  <motion.div
                    className="absolute inset-0 w-full h-full"
                    animate={{
                      scale: hoveredCard === index ? 1.1 : 0.9,
                      opacity: hoveredCard === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover rounded-t-2xl"
                    />
                  </motion.div>

                  {/* Cute Transition Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-blue-400/20"
                    animate={{
                      opacity: hoveredCard === index ? [0, 0.3, 0] : 0,
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />

                  {/* Sparkle Effects on Hover */}
                  <AnimatePresence>
                    {hoveredCard === index && (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            initial={{
                              x: "50%",
                              y: "50%",
                              opacity: 0,
                              scale: 0,
                            }}
                            animate={{
                              x: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 30}%`,
                              y: `${50 + Math.sin((i * 60 * Math.PI) / 180) * 30}%`,
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
                              duration: 1.2,
                              delay: i * 0.1,
                              ease: "easeOut",
                            }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>

                  {/* Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={{
                      opacity: hoveredCard === index ? 1 : 0,
                    }}
                  />

                  {/* Social Links */}
                  <motion.div
                    className="absolute bottom-4 left-4 right-4 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={{
                      y: hoveredCard === index ? 0 : 10,
                      opacity: hoveredCard === index ? 1 : 0,
                    }}
                    transition={{ delay: 0.1 }}
                  >
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaGithub className="w-4 h-4" />
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaLinkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaTwitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.social.email && (
                      <a
                        href={`mailto:${member.social.email}`}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaEnvelope className="w-4 h-4" />
                      </a>
                    )}
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h4>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {member.bio}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {member.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"
                  animate={{
                    scale: hoveredCard === index ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <div className="relative h-64">
                    <Image
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      fill
                      className="object-cover rounded-t-2xl"
                    />
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/30 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {selectedMember.name}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                      {selectedMember.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {selectedMember.bio}
                    </p>

                    {/* Skills */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Skills & Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex space-x-4">
                      {selectedMember.social.github && (
                        <a
                          href={selectedMember.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <FaGithub className="w-5 h-5" />
                        </a>
                      )}
                      {selectedMember.social.linkedin && (
                        <a
                          href={selectedMember.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <FaLinkedin className="w-5 h-5" />
                        </a>
                      )}
                      {selectedMember.social.twitter && (
                        <a
                          href={selectedMember.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <FaTwitter className="w-5 h-5" />
                        </a>
                      )}
                      {selectedMember.social.email && (
                        <a
                          href={`mailto:${selectedMember.social.email}`}
                          className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <FaEnvelope className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default EnhancedTeamCards;