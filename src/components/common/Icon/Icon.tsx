/**
 * Icon
 *
 * One hand-drawn set rather than a dependency, so every glyph shares the same
 * construction: a 24-unit grid, 1.5 stroke, round caps and joins, and no fills.
 * Mixed stroke weights are the fastest way to make an interface look assembled
 * from parts, which is exactly what this set exists to avoid.
 *
 * Icons inherit `currentColor` and scale with the `size` prop. They are hidden
 * from assistive technology by default — an icon beside a label is decoration.
 * Pass a `title` only when the icon is the sole carrier of meaning.
 */

import type { SVGProps } from "react";

export type IconName =
  | "gauge"
  | "layers"
  | "activity"
  | "package"
  | "bolt"
  | "repeat"
  | "contrast"
  | "bell"
  | "sun"
  | "moon"
  | "play"
  | "pause"
  | "search"
  | "chevronRight"
  | "chevronDown"
  | "chevronUp"
  | "arrowRight"
  | "arrowUpRight"
  | "check"
  | "checkCircle"
  | "alertTriangle"
  | "xCircle"
  | "info"
  | "close"
  | "sidebar"
  | "sparkle"
  | "trash"
  | "download"
  | "filter"
  | "clock";

/** Path data only — every glyph is stroked by the shared <svg> below. */
const PATHS: Record<IconName, string> = {
  // Navigation
  gauge: "M12 15.5v-4M12 15.5a2 2 0 100-4 2 2 0 000 4zM13.4 10.6l3.6-3.6M4.6 17.5a9 9 0 1114.8 0",
  layers: "M12 3.5 3.5 8l8.5 4.5L20.5 8 12 3.5zM3.5 13l8.5 4.5 8.5-4.5M3.5 17.5 12 22l8.5-4.5",
  activity: "M3 12.5h3.5l2.5-7 4 14 2.7-7H21",
  package:
    "M20.5 7.8v8.4a1.5 1.5 0 01-.8 1.3l-7 3.9a1.5 1.5 0 01-1.4 0l-7-3.9a1.5 1.5 0 01-.8-1.3V7.8a1.5 1.5 0 01.8-1.3l7-3.9a1.5 1.5 0 011.4 0l7 3.9a1.5 1.5 0 01.8 1.3zM3.7 7.1 12 11.8l8.3-4.7M12 21.3v-9.5",
  bolt: "M13.2 2.5 4.5 13.4h6.4l-.9 8.1 8.7-10.9h-6.4l.9-8.1z",
  repeat:
    "M17 2.5l3.5 3.5L17 9.5M20.5 6H7a3.5 3.5 0 00-3.5 3.5v1M7 21.5 3.5 18 7 14.5M3.5 18H17a3.5 3.5 0 003.5-3.5v-1",
  contrast: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 3v18a9 9 0 000-18z",

  // Chrome
  bell: "M18 8.5a6 6 0 10-12 0c0 4.2-1.5 5.5-1.5 5.5h15S18 12.7 18 8.5zM13.7 18a2 2 0 01-3.4 0",
  sun: "M12 6.8a5.2 5.2 0 100 10.4 5.2 5.2 0 000-10.4zM12 1.8v2M12 20.2v2M4.8 4.8l1.4 1.4M17.8 17.8l1.4 1.4M1.8 12h2M20.2 12h2M4.8 19.2l1.4-1.4M17.8 6.2l1.4-1.4",
  moon: "M20.5 14.3A8.6 8.6 0 019.7 3.5a8.6 8.6 0 1010.8 10.8z",
  play: "M7.5 4.8l11 7.2-11 7.2V4.8z",
  pause: "M9.2 4.5v15M14.8 4.5v15",
  sidebar: "M4.5 4.5h15v15h-15v-15zM9.8 4.5v15",
  search: "M11 4.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM20 20l-4.4-4.4",
  filter: "M3.5 5.5h17l-6.6 7.8v5.6l-3.8 2.1v-7.7L3.5 5.5z",
  clock: "M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM12 7.2V12l3.2 1.9",
  trash: "M4.5 6.5h15M9.5 6.5V4.8a1.3 1.3 0 011.3-1.3h2.4a1.3 1.3 0 011.3 1.3v1.7M8 6.5v13a1.5 1.5 0 001.5 1.5h5a1.5 1.5 0 001.5-1.5v-13",
  download: "M12 3.5v11.5M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15",

  // Direction
  chevronRight: "M9.5 5.5 16 12l-6.5 6.5",
  chevronDown: "M5.5 9.5 12 16l6.5-6.5",
  chevronUp: "M5.5 14.5 12 8l6.5 6.5",
  arrowRight: "M4.5 12h15M13.5 6l6 6-6 6",
  arrowUpRight: "M7 17 17 7M8.5 7H17v8.5",
  close: "M6 6l12 12M18 6L6 18",

  // Status
  check: "M4.5 12.5 9.5 17.5 19.5 6.5",
  checkCircle: "M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM8.2 12.2l2.6 2.6 5-5.4",
  alertTriangle:
    "M10.7 4.2 2.9 17.5a1.5 1.5 0 001.3 2.3h15.6a1.5 1.5 0 001.3-2.3L13.3 4.2a1.5 1.5 0 00-2.6 0zM12 9.2v4M12 16.6h.01",
  xCircle: "M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM14.8 9.2l-5.6 5.6M9.2 9.2l5.6 5.6",
  info: "M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM12 11.2v5M12 7.8h.01",
  sparkle:
    "M12 3.2l1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1-5.1-1.9 5.1-1.9L12 3.2zM18.5 16.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9z",
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Edge length in px. Sits on the 4px grid: 14, 16, 18, 20, 24. */
  size?: number;
  /** Supply only when no adjacent text carries the icon's meaning. */
  title?: string;
}

export function Icon({ name, size = 16, title, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
