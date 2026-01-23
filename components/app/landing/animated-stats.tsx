"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const stats: StatItem[] = [
  { value: 258, suffix: "", label: "React Native Commits", description: "Core contributions" },
  { value: 29, suffix: "M+", label: "Downloads", description: "Open source impact" },
  { value: 500, suffix: "+", label: "Projects Delivered", description: "Successful deployments" },
  { value: 50, suffix: "+", label: "Happy Clients", description: "Satisfied partners" },
];

const AnimatedStats = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated]);

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Our Impact in Numbers
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real metrics that showcase our commitment to excellence and innovation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              style={{
                animationDelay: `${index * 0.2}s`,
                animation: hasAnimated ? "fadeInUp 0.8s ease-out forwards" : "none",
                opacity: hasAnimated ? 1 : 0,
                transform: hasAnimated ? "translateY(0)" : "translateY(30px)",
              }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 text-center">
                <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {hasAnimated && (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      delay={index * 0.3}
                      suffix={stat.suffix}
                      separator=","
                    />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{stat.label}</h3>
                <p className="text-gray-300 text-sm">{stat.description}</p>
              </div>

              {/* Floating particles effect */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75" />
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default AnimatedStats;