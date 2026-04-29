import type { ReactNode } from "react";

export type GridProps = {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
};

export function Grid({ children, className, columns = 3 }: GridProps) {
  const gridClassName = ["factory-grid", `factory-grid--${columns}`, className]
    .filter(Boolean)
    .join(" ");

  return <div className={gridClassName}>{children}</div>;
}
