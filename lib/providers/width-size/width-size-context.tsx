import { createContext, useContext } from "react";

type WidthSizeContextType = {
  widthSize: number;
};

const widthSizeContextDefaultValue: WidthSizeContextType = {
  widthSize: 0,
};

export const WidthSizeContext = createContext(widthSizeContextDefaultValue);

export const useWidthSizeContext = () => useContext(WidthSizeContext);
