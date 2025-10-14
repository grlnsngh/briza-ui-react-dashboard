/**
 * Formatter Utility Tests
 */

import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatDuration,
  formatBytes,
  formatPercentage,
  formatDate,
} from "../../../src/utils/formatters";

describe("formatNumber", () => {
  it("should format integer numbers with default precision", () => {
    expect(formatNumber(42)).toBe("42");
    expect(formatNumber(1234)).toBe("1234");
  });

  it("should format decimal numbers with specified precision", () => {
    expect(formatNumber(3.14159, 2)).toBe("3.14");
    expect(formatNumber(3.14159, 3)).toBe("3.142");
    expect(formatNumber(3.14159, 0)).toBe("3");
  });

  it("should handle zero", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(0, 2)).toBe("0.00");
  });

  it("should handle negative numbers", () => {
    expect(formatNumber(-42)).toBe("-42");
    expect(formatNumber(-3.14159, 2)).toBe("-3.14");
  });

  it("should handle very large numbers", () => {
    expect(formatNumber(1000000)).toBe("1000000");
    expect(formatNumber(1234567.89, 2)).toBe("1234567.89");
  });

  it("should handle very small numbers", () => {
    expect(formatNumber(0.00001, 5)).toBe("0.00001");
    expect(formatNumber(0.123456, 3)).toBe("0.123");
  });
});

describe("formatDuration", () => {
  it("should format milliseconds for values < 1000ms", () => {
    expect(formatDuration(0)).toBe("0ms");
    expect(formatDuration(1)).toBe("1ms");
    expect(formatDuration(123)).toBe("123ms");
    expect(formatDuration(999)).toBe("999ms");
  });

  it("should format seconds for values >= 1000ms", () => {
    expect(formatDuration(1000)).toBe("1.00s");
    expect(formatDuration(1234)).toBe("1.23s");
    expect(formatDuration(5678)).toBe("5.68s");
  });

  it("should format minutes for values >= 60000ms", () => {
    expect(formatDuration(60000)).toBe("1.00m");
    expect(formatDuration(90000)).toBe("1.50m");
    expect(formatDuration(123456)).toBe("2.06m");
  });

  it("should handle edge cases", () => {
    expect(formatDuration(999.9)).toBe("1000ms");
    expect(formatDuration(1000.1)).toBe("1.00s");
  });
});

describe("formatBytes", () => {
  it("should format bytes for values < 1024", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("should format kilobytes", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("should format megabytes", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.5 MB");
  });

  it("should format gigabytes", () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1.0 GB");
    expect(formatBytes(1024 * 1024 * 1024 * 1.5)).toBe("1.5 GB");
  });

  it("should use custom precision", () => {
    expect(formatBytes(1536, 2)).toBe("1.50 KB");
    expect(formatBytes(1536, 0)).toBe("2 KB");
  });
});

describe("formatPercentage", () => {
  it("should format percentages with default precision", () => {
    expect(formatPercentage(0)).toBe("0%");
    expect(formatPercentage(50)).toBe("50%");
    expect(formatPercentage(100)).toBe("100%");
  });

  it("should format percentages with decimal precision", () => {
    expect(formatPercentage(33.333, 1)).toBe("33.3%");
    expect(formatPercentage(66.666, 2)).toBe("66.67%");
  });

  it("should handle edge cases", () => {
    expect(formatPercentage(0.1, 1)).toBe("0.1%");
    expect(formatPercentage(99.9, 1)).toBe("99.9%");
    expect(formatPercentage(100.0, 1)).toBe("100.0%");
  });

  it("should handle values > 100", () => {
    expect(formatPercentage(150)).toBe("150%");
    expect(formatPercentage(200.5, 1)).toBe("200.5%");
  });
});

describe("formatDate", () => {
  it("should format timestamps correctly", () => {
    const timestamp = new Date("2025-10-13T12:00:00Z").getTime();
    const formatted = formatDate(timestamp);

    // Basic check that it contains expected parts
    expect(formatted).toContain("2025");
    expect(formatted).toContain("10");
    expect(formatted).toContain("13");
  });

  it("should handle Date.now() timestamps", () => {
    const timestamp = Date.now();
    const formatted = formatDate(timestamp);
    const currentYear = new Date().getFullYear().toString();

    expect(formatted).toContain(currentYear);
  });

  it("should handle invalid timestamps", () => {
    const result = formatDate(NaN);
    expect(result).toBe("Invalid Date");
  });
});
