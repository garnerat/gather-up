'use client';

import { useState, useMemo } from 'react';
import type { Weekend } from '@/types';

interface WeekendPickerProps {
  selectedWeekends: Weekend[];
  onWeekendsChange: (weekends: Weekend[]) => void;
}

// Get days in a month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get day of week for first day of month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Format date as YYYY-MM-DD
function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Check if a date is a weekend (Saturday or Sunday)
function isWeekendDay(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

// Check if date is in the past
function isPastDate(year: number, month: number, day: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(year, month, day);
  return date < today;
}

// Parse a date string to get year, month, day
function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month: month - 1, day };
}

// Get the Saturday-Sunday pair for a given weekend day
function getWeekendPair(year: number, month: number, day: number): Weekend | null {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 6) {
    // Saturday - pair with Sunday
    const sunday = new Date(year, month, day + 1);
    return {
      start: formatDate(year, month, day),
      end: formatDate(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()),
    };
  } else if (dayOfWeek === 0) {
    // Sunday - pair with Saturday
    const saturday = new Date(year, month, day - 1);
    return {
      start: formatDate(saturday.getFullYear(), saturday.getMonth(), saturday.getDate()),
      end: formatDate(year, month, day),
    };
  }
  return null;
}

// Check if a weekend is selected
function isWeekendSelected(weekends: Weekend[], year: number, month: number, day: number): boolean {
  const dateStr = formatDate(year, month, day);
  return weekends.some(w => w.start === dateStr || w.end === dateStr);
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekendPicker({ selectedWeekends, onWeekendsChange }: WeekendPickerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: Array<{ day: number; isCurrentMonth: boolean; isWeekend: boolean; isPast: boolean }> = [];

    // Previous month padding
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        day,
        isCurrentMonth: false,
        isWeekend: isWeekendDay(prevYear, prevMonth, day),
        isPast: true,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isWeekend: isWeekendDay(currentYear, currentMonth, day),
        isPast: isPastDate(currentYear, currentMonth, day),
      });
    }

    // Next month padding
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const remainingDays = 42 - days.length; // 6 rows * 7 days

    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isWeekend: isWeekendDay(nextYear, nextMonth, day),
        isPast: false,
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean, isPast: boolean, isWeekend: boolean) => {
    if (!isWeekend || isPast) return;

    // Determine which month/year this day belongs to
    let targetMonth = currentMonth;
    let targetYear = currentYear;

    if (!isCurrentMonth) {
      // Check if it's from previous or next month based on day number
      if (day > 15) {
        // Previous month
        targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      } else {
        // Next month
        targetMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        targetYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      }
    }

    const weekendPair = getWeekendPair(targetYear, targetMonth, day);
    if (!weekendPair) return;

    // Check if this weekend is already selected
    const existingIndex = selectedWeekends.findIndex(
      w => w.start === weekendPair.start && w.end === weekendPair.end
    );

    if (existingIndex >= 0) {
      // Remove the weekend
      const newWeekends = selectedWeekends.filter((_, i) => i !== existingIndex);
      onWeekendsChange(newWeekends);
    } else {
      // Add the weekend
      onWeekendsChange([...selectedWeekends, weekendPair]);
    }
  };

  // Get which month a day belongs to for selection checking
  const getDayContext = (dayIndex: number, day: number) => {
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    if (dayIndex < firstDay) {
      // Previous month
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return { year: prevYear, month: prevMonth, day };
    } else if (dayIndex >= firstDay + daysInMonth) {
      // Next month
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      return { year: nextYear, month: nextMonth, day };
    }
    return { year: currentYear, month: currentMonth, day };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-gray-900">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-3">
        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((name, i) => (
            <div
              key={name}
              className={`text-center text-xs font-medium py-2 ${
                i === 0 || i === 6 ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayInfo, index) => {
            const context = getDayContext(index, dayInfo.day);
            const isSelected = isWeekendSelected(selectedWeekends, context.year, context.month, dayInfo.day);
            const isClickable = dayInfo.isWeekend && !dayInfo.isPast;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDayClick(dayInfo.day, dayInfo.isCurrentMonth, dayInfo.isPast, dayInfo.isWeekend)}
                disabled={!isClickable}
                className={`
                  relative h-10 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${!dayInfo.isCurrentMonth ? 'text-gray-300' : ''}
                  ${dayInfo.isCurrentMonth && !dayInfo.isWeekend ? 'text-gray-400' : ''}
                  ${dayInfo.isCurrentMonth && dayInfo.isWeekend && !dayInfo.isPast ? 'text-blue-600' : ''}
                  ${dayInfo.isPast && dayInfo.isWeekend ? 'text-gray-300' : ''}
                  ${isClickable ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'}
                  ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                `}
              >
                {dayInfo.day}
                {dayInfo.isWeekend && dayInfo.isCurrentMonth && !dayInfo.isPast && (
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-blue-400'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600"></span>
              Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border-2 border-blue-400"></span>
              Available
            </span>
          </div>
          <span>{selectedWeekends.length} weekend{selectedWeekends.length !== 1 ? 's' : ''} selected</span>
        </div>
      </div>
    </div>
  );
}
