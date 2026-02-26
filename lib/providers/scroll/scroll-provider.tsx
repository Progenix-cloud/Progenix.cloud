"use client";

import { useState, useEffect, ReactNode } from "react";
import { ScrollContext } from "@/lib/providers/scroll/scroll-context";

type ScrollType = {
  children: ReactNode;
};

const ScrollProvider = ({ children }: ScrollType) => {
  const [scroll, setScroll] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setScroll(window.scrollY);

    const handleScroll = () => {
      setScroll(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ScrollContext.Provider value={{ scroll: isClient ? scroll : 0 }}>
      {children}
    </ScrollContext.Provider>
  );
};

export default ScrollProvider;
