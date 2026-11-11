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

const legacyCommentPlaceholder = /^(?:no description provided\.?|submitted via photo analysis\.|waste report submitted via (?:mobile|quick) capture\.(?: Category: (?:With|No) Waste\.)?)$/i;
const analysisSummary = /^(?:Waste detected|No waste detected)\. Severity: (?:None|Low|Medium|High|Critical)\.$/;

export function citizenComment(description?: string | null, aiReason?: string | null): string {
  const comment = description?.trim();
  if (!comment || legacyCommentPlaceholder.test(comment)) return "None";
  if (comment === aiReason?.trim() && !analysisSummary.test(comment)) return "None";
  return comment;
}
