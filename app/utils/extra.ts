
import { Time } from '@internationalized/date';

export enum DateFormatType {
  DateOnly = 'dateOnly',
  DateWithTime = 'dateWithTime',
  Numerical = 'numerical',
  MonthDay = 'monthDay',
  YearOnly = 'yearOnly',
  TimeOnly = 'timeOnly',
  Full = 'full',
  DateYearWithTime = 'dateYearWithTime',
  DEFAULT = 'default'
}

export function formatDate2(dateTime: Date | string | null | undefined, formatType: DateFormatType = DateFormatType.DEFAULT): string {
  if (!dateTime) return '';

  const date = new Date(dateTime); // Ensures it's a Date instance
  if (isNaN(date.getTime())) return ''; // Invalid date check

  const now = new Date();
  const isSameYear = now.getFullYear() === date.getFullYear();

  const options: Intl.DateTimeFormatOptions = (() => {
    switch (formatType) {
      case DateFormatType.DateOnly:
        return isSameYear
          ? { month: 'short', day: 'numeric' }
          : { month: 'short', day: 'numeric', year: 'numeric' };

      case DateFormatType.DateWithTime:
        return isSameYear
          ? { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }
          : { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };

      case DateFormatType.Numerical:
        return { year: 'numeric', month: '2-digit', day: '2-digit' };

      case DateFormatType.MonthDay:
        return { month: 'short', day: 'numeric' };

      case DateFormatType.YearOnly:
        return { year: 'numeric' };

      case DateFormatType.TimeOnly:
        return { hour: 'numeric', minute: 'numeric', hour12: true };

      case DateFormatType.Full:
        return {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        };
      default:
        return {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        }
    }
  })();

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export const formatTime24 = (time: Time) => `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;

export const parseTime = (value?: string): Time => {
  if (!value) return new Time(0, 0);

  const [hour, minute] = value.split(':').map(Number);
  return new Time(hour, minute);
};

export function getWeekDayNumber(date: Date | string): number {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
    }

    const day = parsedDate.getDay();
    return day === 0 ? 7 : day;
}

export function buildQuery(
  query: Record<
    string,
    string | number | boolean | readonly (string | number | boolean)[] | null | undefined
  >
): string {
  const params = new URLSearchParams();

  for (const key in query) {
    const value = query[key];

    if (value == null || value === '') continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
    } else {
      params.append(key, String(value));
    }
  }

  return params.toString();
}