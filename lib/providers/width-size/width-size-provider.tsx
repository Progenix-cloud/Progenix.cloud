"use client";

import { useState, useEffect, ReactNode } from "react";
import { WidthSizeContext } from "@/lib/providers/width-size/width-size-context";

type WidthSizeType = {
  children: ReactNode;
};

const WidthSizeProvider = ({ children }: WidthSizeType) => {
  const [widthSize, setWidthSize] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setWidthSize(window.innerWidth);

    const handleResize = () => {
      setWidthSize(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <WidthSizeContext.Provider value={{ widthSize: isClient ? widthSize : 0 }}>
      {children}
    </WidthSizeContext.Provider>
  );
};

export default WidthSizeProvider;
