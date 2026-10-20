import { DaySchedule, Restaurant } from '../types';

export const DAYS_OF_WEEK: DaySchedule['day'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Converts 24-hour format "HH:MM" (e.g. "09:00", "23:30") to friendly 12-hour string (e.g. "9:00 AM", "11:30 PM")
 */
export function formatTime12h(time24?: string): string {
  if (!time24 || !time24.includes(':')) return '09:00 AM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  const minFormatted = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${minFormatted} ${ampm}`;
}

/**
 * Generate standard Monday through Sunday schedule
 */
export function getDefaultSchedule(
  openTime = '09:00',
  closeTime = '23:00'
): DaySchedule[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    isOpen: true,
    openTime,
    closeTime,
  }));
}

export interface RestaurantOpenStatus {
  isOpen: boolean;
  statusText: string;
  timeBadgeText: string;
  nextScheduleText: string;
  isAutoScheduled: boolean;
  activeTodaySchedule?: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

/**
 * Accurately check whether a restaurant is open right now considering:
 * 1. Manual override (`isOpen`)
 * 2. Auto-schedule configuration (`autoOpenClose`)
 * 3. Day-wise hours and overnight shifts
 */
export function checkRestaurantOpenStatus(
  restaurant: Partial<Restaurant>
): RestaurantOpenStatus {
  const isAutoScheduled = Boolean(restaurant.autoOpenClose);
  const defaultOpen = restaurant.openingTime || '09:00';
  const defaultClose = restaurant.closingTime || '23:00';

  // If manual override is explicitly closed, treat as closed immediately
  if (restaurant.isOpen === false) {
    return {
      isOpen: false,
      statusText: 'Kitchen Temporarily Closed',
      timeBadgeText: 'Closed Now',
      nextScheduleText: 'The restaurant is currently closed for orders',
      isAutoScheduled,
    };
  }

  // If auto-schedule is NOT enabled, follow the manual open switch
  if (!isAutoScheduled) {
    return {
      isOpen: true,
      statusText: 'Kitchen Open (Accepting Orders)',
      timeBadgeText: restaurant.closingTime
        ? `Open until ${formatTime12h(restaurant.closingTime)}`
        : 'Open Now',
      nextScheduleText: restaurant.closingTime
        ? `Standard closing time: ${formatTime12h(restaurant.closingTime)}`
        : 'Open for live orders',
      isAutoScheduled: false,
    };
  }

  // Auto-schedule logic
  const now = new Date();
  const dayNames: DaySchedule['day'][] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const todayName = dayNames[now.getDay()];

  const daySchedule = restaurant.schedule?.find((s) => s.day === todayName) || {
    day: todayName,
    isOpen: true,
    openTime: defaultOpen,
    closeTime: defaultClose,
  };

  if (!daySchedule.isOpen) {
    return {
      isOpen: false,
      statusText: `Closed on ${todayName}s`,
      timeBadgeText: 'Closed Today',
      nextScheduleText: `Outlet is closed every ${todayName}`,
      isAutoScheduled: true,
      activeTodaySchedule: daySchedule,
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseMinutes = (timeStr: string) => {
    const [h, m] = (timeStr || '00:00').split(':').map((v) => parseInt(v, 10) || 0);
    return h * 60 + m;
  };

  const openMinutes = parseMinutes(daySchedule.openTime);
  const closeMinutes = parseMinutes(daySchedule.closeTime);

  let isCurrentlyOpen = false;

  if (closeMinutes > openMinutes) {
    // Normal same-day window (e.g. 09:00 to 23:00)
    isCurrentlyOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } else if (closeMinutes < openMinutes) {
    // Overnight window (e.g. 18:00 to 02:00)
    isCurrentlyOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  } else {
    // 24 hours open if times are identical
    isCurrentlyOpen = true;
  }

  if (isCurrentlyOpen) {
    const minutesLeft =
      closeMinutes > currentMinutes
        ? closeMinutes - currentMinutes
        : 24 * 60 - currentMinutes + closeMinutes;
    const hoursLeft = Math.floor(minutesLeft / 60);
    const minsRem = minutesLeft % 60;
    const timeLeftStr =
      hoursLeft > 0 ? `${hoursLeft}h ${minsRem}m` : `${minsRem} mins`;

    return {
      isOpen: true,
      statusText: 'Open Now (Accepting Orders)',
      timeBadgeText: `Open until ${formatTime12h(daySchedule.closeTime)}`,
      nextScheduleText: `Closes in ${timeLeftStr} (${formatTime12h(daySchedule.closeTime)})`,
      isAutoScheduled: true,
      activeTodaySchedule: daySchedule,
    };
  }

  // If before opening
  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      statusText: 'Kitchen Closed Now',
      timeBadgeText: `Opens at ${formatTime12h(daySchedule.openTime)}`,
      nextScheduleText: `Opens today at ${formatTime12h(daySchedule.openTime)}`,
      isAutoScheduled: true,
      activeTodaySchedule: daySchedule,
    };
  }

  // After closing
  return {
    isOpen: false,
    statusText: 'Kitchen Closed for the Day',
    timeBadgeText: 'Closed for Today',
    nextScheduleText: `Opens tomorrow at ${formatTime12h(daySchedule.openTime)}`,
    isAutoScheduled: true,
    activeTodaySchedule: daySchedule,
  };
}
