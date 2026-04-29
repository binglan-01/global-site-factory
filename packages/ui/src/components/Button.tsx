import type { ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export function Button({ children, className, disabled = false, href, type = "button" }: ButtonProps) {
  const buttonClassName = ["factory-button", className].filter(Boolean).join(" ");

  if (href) {
    return (
      <a aria-disabled={disabled} className={buttonClassName} href={disabled ? undefined : href}>
        {children}
      </a>
    );
  }

  return (
    <button className={buttonClassName} disabled={disabled} type={type}>
      {children}
    </button>
  );
}
