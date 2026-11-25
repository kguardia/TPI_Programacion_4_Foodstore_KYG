import type { HTMLAttributes } from "react";

function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg bg-white p-4 shadow ${className}`} {...props} />;
}

export default Card;
