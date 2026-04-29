import type { ReactNode } from "react";

export type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  const badgeClassName = ["factory-badge", className].filter(Boolean).join(" ");

  return <span className={badgeClassName}>{children}</span>;
}
