import type { ReactNode } from "react";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
};

export function Container({ as: Component = "div", children, className }: ContainerProps) {
  const containerClassName = ["factory-container", className].filter(Boolean).join(" ");

  return <Component className={containerClassName}>{children}</Component>;
}
