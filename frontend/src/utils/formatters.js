/**
 * Utility functions for formatting dates, numbers, and text.
 */

/**
 * Return a human-readable relative time string (e.g. "2h ago", "3d ago").
 * @param {string|Date} dateInput - ISO date string or Date object.
 * @returns {string}
 */
export function timeAgo(dateInput) {
  if (!dateInput) return "";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return date.toLocaleDateString();
}

/**
 * Format a date for display in a profile (e.g. "March 2024").
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Format a timestamp for chat messages (e.g. "2:45 PM").
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatMessageTime(dateInput) {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format large numbers with abbreviations (e.g. 1500 -> "1.5K").
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Truncate text to a maximum length with an ellipsis.
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(text, maxLen = 100) {
  if (!text || text.length <= maxLen) return text || "";
  return text.slice(0, maxLen).trimEnd() + "...";
}
