"use client";

import { ComponentType, ReactNode } from "react";

type ComposeProps = {
  providers: Array<ComponentType<{ children: ReactNode }> | ReactNode>;
  children: ReactNode;
};

const Compose = ({ providers, children }: ComposeProps) => {
  return providers.reverse().reduce((acc: ReactNode, Provider: any) => {
    if (typeof Provider === "function") {
      return <Provider>{acc}</Provider>;
    }
    return <>{acc}</>;
  }, children);
};

export default Compose;
