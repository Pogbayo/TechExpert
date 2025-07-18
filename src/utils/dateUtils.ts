import { format, isToday, isYesterday } from "date-fns";

/**
 * Formats a timestamp for display in chat room list
 * - If today: shows time (e.g., 2:30 PM)
 * - If yesterday: shows "Yesterday with time on new line
 * - If older: shows exact date and time
 * - If invalid/missing: returns empty string
 */
export function formatLastMessageTime(timestamp: string | number | Date | null | undefined): string {
  if (!timestamp) return "";

  let date: Date;
  // Handle number (Unix timestamp in ms or s)
  if (typeof timestamp === "number") {
    // If it's in seconds, convert to ms
    date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
  } else if (typeof timestamp === "string") {
    // Try ISO, then fallback to parse
    date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      // Try replacing space with T and adding Z
      date = new Date(timestamp.replace(" ", "T") + "Z");
    }
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) {
    return "";
  }

  if (isToday(date)) {
    // Today - show time
    return format(date, "h:mm a");
  } else if (isYesterday(date)) {
    // Yesterday - show "Yesterday with time on new line
    return `Yesterday\n${format(date, "h:mm a")}`;
  } else {
    // Older - show short date (MM/dd/yy)
    return format(date, "MM/dd/yy");
  }
}

/**
 * Formats a timestamp for display in chat messages
 * Shows time for today, "Yesterday" for yesterday, and full date for older messages
 */
export function formatMessageTime(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return "";

  try {
    const date = typeof timestamp === "string" 
      ? new Date(timestamp.replace(" ", "T") + "Z")
      : new Date(timestamp);

    if (isNaN(date.getTime())) {
      return "";
    }

    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM dd, yyyy at h:mm a");
    }
  } catch (error) {
    console.error("Error formatting message timestamp:", error);
    return "";
  }
} 