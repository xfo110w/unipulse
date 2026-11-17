/**
 * Date formatting utilities for UniPulse.
 * Handles UTC naive ISO strings from backend and formats properly in Thai locale (UTC+7).
 */

export const parseUtcDate = (isoStr?: string | null): Date | null => {
  if (!isoStr) return null;
  // If string has no timezone indicator (no 'Z' and no timezone offset like +07:00 or -05:00)
  // we assume it is UTC coming from server.
  const hasTz = isoStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(isoStr);
  const normalized = hasTz ? isoStr : `${isoStr}Z`;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
};

export const formatThaiDateTime = (isoStr?: string | null): string => {
  const d = parseUtcDate(isoStr);
  if (!d) return '—';
  return d.toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatThaiTime = (isoStr?: string | null): string => {
  const d = parseUtcDate(isoStr);
  if (!d) return '—';
  return d.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatDuration = (startIso: string, endIso?: string | null): string => {
  const s = parseUtcDate(startIso)?.getTime() ?? 0;
  const e = endIso ? (parseUtcDate(endIso)?.getTime() ?? Date.now()) : Date.now();
  const diffSec = Math.max(0, Math.floor((e - s) / 1000));
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  const secs = diffSec % 60;

  if (days > 0) return `${days} วัน ${hours} ชม. ${mins} นาที`;
  if (hours > 0) return `${hours} ชม. ${mins} นาที`;
  if (mins > 0) return `${mins} นาที ${secs} วิ`;
  return `${secs} วินาที`;
};
