/**
 * Main Layout Component
 *
 * Provides the main application layout structure with sidebar navigation,
 * header, and content area. Responsive design with collapsible sidebar.
 */

import { useState, type ReactNode } from "react";
import { usePerformanceAlerts } from "../../../hooks";
import { PerformanceAlerts } from "../PerformanceAlerts";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Performance alerts
  const { activeAlerts, dismissAlert, dismissAll } = usePerformanceAlerts({
    checkInterval: 5000, // Check every 5 seconds
    enabled: true,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div
        className={`${styles.mainContainer} ${
          !sidebarOpen ? styles.sidebarClosed : ""
        }`}
      >
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        <main className={styles.content}>{children}</main>
      </div>

      {/* Performance Alerts */}
      <PerformanceAlerts
        alerts={activeAlerts}
        onDismiss={dismissAlert}
        onDismissAll={dismissAll}
        maxVisible={5}
      />
    </div>
  );
}
