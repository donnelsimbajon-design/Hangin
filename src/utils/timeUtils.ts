/**
 * Philippine Standard Time (PST / PHT, UTC+8) Utilities
 * Provides real-time clock and time-of-day phases (Day, Afternoon, Night)
 * strictly synchronized to Philippine time.
 */

export type PhilippineTimePhase = 'day' | 'afternoon' | 'night';

export interface PhilippineTimeData {
  timeStr: string; // e.g. "3:45 PM"
  timeFullStr: string; // e.g. "3:45:12 PM PHT"
  dateStr: string; // e.g. "Wednesday, Oct 24"
  hour24: number; // 0-23
  minute: number; // 0-59
  phase: PhilippineTimePhase;
  phaseLabel: string; // "Morning / Day", "Golden Afternoon", "Starlit Night"
  greeting: {
    english: string;
    tagalog: string;
  };
}

/**
 * Get current date and time calculated for Philippine Time (UTC+8)
 */
export function getPhilippineTime(overridePhase?: PhilippineTimePhase | null): PhilippineTimeData {
  // Use Intl API to reliably format into Asia/Manila timezone
  const now = new Date();

  // Extract Philippine components
  const formatterManila = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const parts = formatterManila.formatToParts(now);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const hour24 = parseInt(partMap.hour || '12', 10);
  const minute = parseInt(partMap.minute || '0', 10);

  // Format 12-hour string
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const minStr = minute < 10 ? `0${minute}` : `${minute}`;
  const timeStr = `${hour12}:${minStr} ${ampm}`;
  const timeFullStr = `${timeStr} PHT`;
  const dateStr = `${partMap.weekday}, ${partMap.month} ${partMap.day}`;

  // Determine time phase:
  // Day: 06:00 - 15:59 (6:00 AM to 3:59 PM)
  // Afternoon / Sunset: 16:00 - 18:29 (4:00 PM to 6:29 PM)
  // Night: 18:30 - 05:59 (6:30 PM to 5:59 AM)
  let calculatedPhase: PhilippineTimePhase = 'day';
  if (hour24 >= 6 && hour24 < 16) {
    calculatedPhase = 'day';
  } else if (hour24 >= 16 && (hour24 < 18 || (hour24 === 18 && minute < 30))) {
    calculatedPhase = 'afternoon';
  } else {
    calculatedPhase = 'night';
  }

  const activePhase = overridePhase || calculatedPhase;

  let phaseLabel = 'Crisp Day';
  let greeting = {
    english: 'Good day',
    tagalog: 'Magandang araw',
  };

  if (activePhase === 'day') {
    if (hour24 < 12) {
      phaseLabel = 'Sunlit Morning';
      greeting = { english: 'Good morning', tagalog: 'Magandang umaga' };
    } else {
      phaseLabel = 'Bright Afternoon';
      greeting = { english: 'Good day', tagalog: 'Magandang araw' };
    }
  } else if (activePhase === 'afternoon') {
    phaseLabel = 'Golden Sunset';
    greeting = { english: 'Good afternoon', tagalog: 'Magandang hapon' };
  } else {
    phaseLabel = 'Peaceful Night';
    greeting = { english: 'Good evening', tagalog: 'Magandang gabi' };
  }

  return {
    timeStr,
    timeFullStr,
    dateStr,
    hour24,
    minute,
    phase: activePhase,
    phaseLabel,
    greeting,
  };
}
