import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: string | Date) {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export async function getReverseGeocodedLocation(latitude: number, longitude: number): Promise<string | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
      headers: {
        'User-Agent': 'BlueWaste-Admin/1.0'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.display_name) {
      return data.display_name;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function formatAnalysisDetails(
  categories?: string[] | null,
  defaultReason?: string | null,
): string {
  if (
    defaultReason &&
    typeof defaultReason === "string" &&
    defaultReason.trim().length > 0 &&
    !defaultReason.toLowerCase().includes("ready to submit") &&
    !defaultReason.toLowerCase().includes("waste detected (") &&
    !defaultReason.toLowerCase().includes("waste report submitted")
  ) {
    return defaultReason.trim();
  }

  const cleanCategories = (categories || [])
    .filter((cat) => typeof cat === "string" && cat !== "with_waste" && cat !== "no_waste")
    .map((cat) => cat.toLowerCase().replace(/_/g, " "));

  if (cleanCategories.length === 0) {
    return "No additional analysis details are available.";
  }
  return `Detected categories: ${cleanCategories.join(", ")}.`;
}
