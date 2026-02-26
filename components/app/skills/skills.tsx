"use client";

import { useRef } from "react";
import { useScrollContext } from "@/lib/providers/scroll/scroll-context";
import styles from "styles/modules/skills.module.css";
import { skillsText } from "@/lib/constants/app/skills";
import SnakeRoadmap from "./snake-roadmap";

const opacityForBlock = (sectionProgress: number, blockNumber: number) => {
  const progress = sectionProgress - blockNumber;

  if (progress >= 0 && progress < 1) {
    return 1;
  }
  return 0.2;
};

const Skills = () => {
  const { scroll } = useScrollContext();

  const refContainer = useRef<HTMLDivElement>(null);

  const numberOfBlocks = 3;
  let progress = 0;

  if (refContainer.current) {
    const { clientHeight, offsetTop } = refContainer.current;
    const screenHeight = window.innerHeight;
    const halfScreenHeight = screenHeight / 2;
    const percentY =
      Math.min(
        clientHeight + halfScreenHeight,
        Math.max(-screenHeight, scroll - offsetTop) + halfScreenHeight
      ) / clientHeight;

    progress = Math.min(
      numberOfBlocks - 0.5,
      Math.max(0.5, percentY * numberOfBlocks)
    );
  }

  return (
    <section className="bg-black text-white" ref={refContainer}>
      <div className="min-h-screen flex flex-col justify-center items-center">
        {/* Skills Text */}
        <div className="text-4xl font-semibold flex flex-col justify-center items-center tracking-tight md:text-6xl lg:text-7xl mb-20">
          <div className="leading-[1.15] text-center max-w-4xl px-10">
            <div
              className={styles.skills__text}
              style={{ opacity: opacityForBlock(progress, 0) }}
            >
              {skillsText[0]}
            </div>
            <span
              className={`${styles.skills__text} inline-block my-5 after:content-['_']`}
              style={{ opacity: opacityForBlock(progress, 1) }}
            >
              {skillsText[1]}
            </span>
            <span
              className={`${styles.skills__text} inline-block`}
              style={{ opacity: opacityForBlock(progress, 2) }}
            >
              {skillsText[2]}
            </span>
          </div>
        </div>

        {/* Snake Roadmap */}
        <SnakeRoadmap />
      </div>
    </section>
  );
};

export default Skills;
