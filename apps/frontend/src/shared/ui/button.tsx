import type { ButtonHTMLAttributes, Ref } from "react";
import type { LucideIcon } from "lucide-react";

import styles from "./workflow.module.css";
import { ActivityIndicator } from "./activity-indicator";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "quiet";
  icon?: LucideIcon;
  busy?: boolean;
};

export function Button({
  variant = "primary",
  icon: Icon,
  className,
  children,
  type = "button",
  busy = false,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={busy || props["aria-busy"]}
      type={type}
      className={[styles.button, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {busy ? (
        <ActivityIndicator size={18} />
      ) : Icon ? (
        <Icon size={18} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  icon: Icon,
  className,
  busy = false,
  ...props
}: Omit<ButtonProps, "children" | "icon"> & {
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Button
      {...props}
      busy={busy}
      variant="quiet"
      className={[styles.iconButton, className].filter(Boolean).join(" ")}
      aria-label={label}
      title={label}
    >
      {!busy && <Icon size={20} aria-hidden="true" />}
    </Button>
  );
}
