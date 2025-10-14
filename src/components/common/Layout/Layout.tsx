/**
 * Main Layout Component
 *
 * Provides the main application layout structure with sidebar navigation,
 * header, and content area. Responsive design with collapsible sidebar.
 */

import { useState, type ReactNode } from "react";
import { usePerformanceAlerts } from "../../../hooks";
import { AlertPanel } from "../PerformanceAlerts";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alertPanelOpen, setAlertPanelOpen] = useState(false);

  // Performance alerts
  const { alerts, activeAlerts, dismissAlert, dismissAll, clearDismissed } =
    usePerformanceAlerts({
      checkInterval: 5000, // Check every 5 seconds
      enabled: true,
    });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openAlertPanel = () => {
    setAlertPanelOpen(true);
  };

  const closeAlertPanel = () => {
    setAlertPanelOpen(false);
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div
        className={`${styles.mainContainer} ${
          !sidebarOpen ? styles.sidebarClosed : ""
        }`}
      >
        <Header
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          alertCount={activeAlerts.length}
          onOpenAlerts={openAlertPanel}
        />

        <main className={styles.content}>{children}</main>
      </div>

      {/* Alert Panel */}
      <AlertPanel
        alerts={alerts}
        isOpen={alertPanelOpen}
        onClose={closeAlertPanel}
        onDismiss={dismissAlert}
        onDismissAll={dismissAll}
        onClearDismissed={clearDismissed}
      />
    </div>
  );
}
