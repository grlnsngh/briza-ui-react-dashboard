/**
 * Loading Component
 *
 * Displays a centered loading spinner with optional message
 */

import styles from "./Loading.module.css";

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}>
        <div className={styles.spinnerCircle} />
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
