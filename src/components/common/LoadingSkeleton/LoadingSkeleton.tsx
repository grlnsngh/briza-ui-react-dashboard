/**
 * LoadingSkeleton Component
 *
 * Displays a skeleton loader for content that is being loaded
 */

import styles from "./LoadingSkeleton.module.css";

interface LoadingSkeletonProps {
  /** Width of the skeleton */
  width?: string;
  /** Height of the skeleton */
  height?: string;
  /** Border radius */
  borderRadius?: string;
  /** Additional CSS class */
  className?: string;
}

export default function LoadingSkeleton({
  width = "100%",
  height = "20px",
  borderRadius = "var(--radius-md)",
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
}
