// Utility functions for Philippine Standard Time (PST / PHT, UTC+8 / Asia/Manila)

export const PH_TIMEZONE = 'Asia/Manila';

/**
 * Get current date and time components formatted in Philippine Standard Time
 */
export function getPhNow() {
  const now = new Date();
  
  const dateStr = now.toLocaleDateString('en-US', {
    timeZone: PH_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const fullDateStr = now.toLocaleDateString('en-US', {
    timeZone: PH_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const timeStr = now.toLocaleTimeString('en-US', {
    timeZone: PH_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const shortTimeStr = now.toLocaleTimeString('en-US', {
    timeZone: PH_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const monthYear = now.toLocaleDateString('en-US', {
    timeZone: PH_TIMEZONE,
    month: 'long',
    year: 'numeric'
  });

  const dayOfMonth = parseInt(
    now.toLocaleDateString('en-US', {
      timeZone: PH_TIMEZONE,
      day: 'numeric'
    }),
    10
  );

  const monthIndex = parseInt(
    now.toLocaleDateString('en-US', {
      timeZone: PH_TIMEZONE,
      month: 'numeric'
    }),
    10
  ) - 1;

  const yearNum = parseInt(
    now.toLocaleDateString('en-US', {
      timeZone: PH_TIMEZONE,
      year: 'numeric'
    }),
    10
  );

  return {
    raw: now,
    dateStr,
    fullDateStr,
    timeStr,
    shortTimeStr,
    monthYear,
    dayOfMonth,
    monthIndex,
    yearNum
  };
}

/**
 * Format any date/time value into Philippine date (e.g. "Nov 8, 2026")
 */
export function formatPhDate(dateVal, options = {}) {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-US', {
    timeZone: PH_TIMEZONE,
    month: options.month || 'short',
    day: 'numeric',
    year: options.year || 'numeric',
    ...options
  });
}

/**
 * Format any date/time value into Philippine time (e.g. "02:10 AM")
 */
export function formatPhTime(dateVal, options = {}) {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleTimeString('en-US', {
    timeZone: PH_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  });
}

/**
 * Format any date/time value into full Philippine timestamp (e.g. "Nov 8, 2026, 2:10 AM PHT")
 */
export function formatPhDateTime(dateVal, options = {}) {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '—';

  const datePart = d.toLocaleDateString('en-US', {
    timeZone: PH_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timePart = d.toLocaleTimeString('en-US', {
    timeZone: PH_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `${datePart}, ${timePart} PHT`;
}
