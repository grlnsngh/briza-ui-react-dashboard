/**
 * Button
 *
 * Three levels, and the level is chosen by consequence, not by prominence:
 *
 * - `primary`  the one action a screen exists for. At most one per view.
 * - `default`  everything else with a real effect.
 * - `ghost`    reversible view controls — sorting, filtering, expanding.
 *
 * `danger` is a modifier rather than a level, so a destructive action can be
 * either the main action or a quiet one without inventing a fourth style.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../Icon";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "default" | "ghost";
  size?: "sm" | "md";
  danger?: boolean;
  icon?: IconName;
  /** Places the icon after the label — for "next"-shaped actions. */
  iconAfter?: IconName;
  children?: ReactNode;
}

export function Button({
  variant = "default",
  size = "md",
  danger = false,
  icon,
  iconAfter,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const glyph = size === "sm" ? 13 : 14;

  return (
    <button
      className={[
        styles.button,
        styles[variant],
        styles[size],
        danger ? styles.danger : "",
        children ? "" : styles.iconOnly,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {icon && <Icon name={icon} size={glyph} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={glyph} />}
    </button>
  );
}
