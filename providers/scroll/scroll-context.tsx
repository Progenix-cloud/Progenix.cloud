import { createContext, useContext } from "react";

type ScrollContextType = {
  scroll: number;
};

const scrollContextDefaultValue: ScrollContextType = {
  scroll: 0,
};

export const ScrollContext = createContext(scrollContextDefaultValue);

export const useScrollContext = () => useContext(ScrollContext);
