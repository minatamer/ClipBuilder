import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

import styles from "./workflow.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
  icon?: LucideIcon;
};

export function Button({
  variant = "primary",
  icon: Icon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[styles.button, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {Icon && <Icon size={18} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  icon: Icon,
  className,
  ...props
}: Omit<ButtonProps, "children" | "icon"> & {
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Button
      {...props}
      variant="quiet"
      className={[styles.iconButton, className].filter(Boolean).join(" ")}
      aria-label={label}
      title={label}
    >
      <Icon size={20} aria-hidden="true" />
    </Button>
  );
}
