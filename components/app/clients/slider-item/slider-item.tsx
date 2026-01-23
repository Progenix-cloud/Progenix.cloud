import { ReactNode } from "react";

type SliderItemProps = {
  children: ReactNode;
  width: number;
};

const SliderItem = ({ children, width }: SliderItemProps) => {
  return (
    <div
      className="inline-flex justify-center items-center mx-4"
      style={{ width }}
    >
      {children}
    </div>
  );
};

export default SliderItem;
