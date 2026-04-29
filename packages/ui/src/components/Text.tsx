import type { ReactNode } from "react";

export type TextProps = {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "small";
};

export function Text({ as: Component = "p", children, className }: TextProps) {
  const textClassName = ["factory-text", className].filter(Boolean).join(" ");

  return <Component className={textClassName}>{children}</Component>;
}
