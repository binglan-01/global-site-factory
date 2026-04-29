import type { ReactNode } from "react";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingProps = {
  children: ReactNode;
  className?: string;
  level?: HeadingLevel;
};

export function Heading({ children, className, level = 2 }: HeadingProps) {
  const headingClassName = ["factory-heading", `factory-heading--h${level}`, className]
    .filter(Boolean)
    .join(" ");
  const Component = `h${level}` as const;

  return <Component className={headingClassName}>{children}</Component>;
}
