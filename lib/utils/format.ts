import { format, formatDistanceToNow } from "date-fns";

export function formatDate(date: string | Date): string {
  return format(new Date(date), "PPp");
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatIP(ip: string): string {
  return ip;
}

