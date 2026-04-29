import type { ReactNode } from "react";

export type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  const cardClassName = ["factory-card", className].filter(Boolean).join(" ");

  return <article className={cardClassName}>{children}</article>;
}
