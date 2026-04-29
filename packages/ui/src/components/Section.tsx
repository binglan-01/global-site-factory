import type { ReactNode } from "react";

export type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Section({ children, className, id }: SectionProps) {
  const sectionClassName = ["factory-section", className].filter(Boolean).join(" ");

  return (
    <section className={sectionClassName} id={id}>
      {children}
    </section>
  );
}
