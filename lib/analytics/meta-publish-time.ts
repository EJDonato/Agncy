const META_EXPORT_TIME_ZONE = "UTC";

export function getMetaPublishDay(date: Date): number {
  return date.getUTCDay();
}

export function getMetaPublishHour(date: Date): number {
  return date.getUTCHours();
}

export function formatMetaPublishDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    timeZone: META_EXPORT_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMetaPublishTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-US", {
    timeZone: META_EXPORT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}
