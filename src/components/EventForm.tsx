'use client';

import { useState } from 'react';
import type { Weekend } from '@/types';
import { WeekendPicker } from './WeekendPicker';

interface EventFormProps {
  onSuccess: (data: {
    adminUrl: string;
    attendeeLinks: Array<{ name: string; url: string }>;
  }) => void;
}

// Trash icon
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

// Spinner for loading state
function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// Calendar icon
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

// Format weekend for display
function formatWeekend(weekend: Weekend): string {
  const start = new Date(weekend.start + 'T00:00:00');
  const end = new Date(weekend.end + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

export function EventForm({ onSuccess }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [hostName, setHostName] = useState('');
  const [weekends, setWeekends] = useState<Weekend[]>([]);
  const [attendeesInput, setAttendeesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualWeekends, setManualWeekends] = useState<Weekend[]>([{ start: '', end: '' }]);

  const addManualWeekend = () => {
    setManualWeekends([...manualWeekends, { start: '', end: '' }]);
  };

  const removeManualWeekend = (index: number) => {
    if (manualWeekends.length > 1) {
      setManualWeekends(manualWeekends.filter((_, i) => i !== index));
    }
  };

  const updateManualWeekend = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...manualWeekends];
    updated[index][field] = value;
    setManualWeekends(updated);
  };

  const removeWeekend = (index: number) => {
    setWeekends(weekends.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const attendees = attendeesInput
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (attendees.length === 0) {
      setError('Please add at least one attendee');
      setIsSubmitting(false);
      return;
    }

    // Combine calendar weekends and valid manual weekends
    const validManualWeekends = manualWeekends.filter((w) => w.start && w.end);
    const allWeekends = [...weekends, ...validManualWeekends];

    if (allWeekends.length === 0) {
      setError('Please select at least one weekend from the calendar or add dates manually');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          hostName,
          weekends: allWeekends,
          attendees,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create event');
        return;
      }

      onSuccess(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-150";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Trip Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="e.g., Ski Trip 2025"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="hostName" className="block text-sm font-medium text-gray-700 mb-2">
          Your Name (Host)
        </label>
        <input
          type="text"
          id="hostName"
          name="hostName"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          required
          maxLength={100}
          placeholder="e.g., Mike"
          className={inputClasses}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Weekend Options
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Click on weekends (Sat-Sun) in the calendar to select them
        </p>

        {/* Calendar picker */}
        {showCalendar && (
          <WeekendPicker
            selectedWeekends={weekends}
            onWeekendsChange={setWeekends}
          />
        )}

        {/* Selected weekends chips */}
        {weekends.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Selected weekends:</p>
            <div className="flex flex-wrap gap-2">
              {weekends.map((weekend, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {formatWeekend(weekend)}
                  <button
                    type="button"
                    onClick={() => removeWeekend(index)}
                    className="p-0.5 hover:bg-blue-100 rounded-full transition-colors"
                    aria-label={`Remove ${formatWeekend(weekend)}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle for manual input */}
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showManualInput ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {showManualInput ? 'Hide manual date input' : 'Or enter dates manually'}
        </button>

        {/* Manual date input fallback */}
        {showManualInput && (
          <div className="mt-3 space-y-3">
            {manualWeekends.map((weekend, index) => (
              <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="date"
                    name={`weekend-${index}-start`}
                    value={weekend.start}
                    onChange={(e) => updateManualWeekend(index, 'start', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="date"
                    name={`weekend-${index}-end`}
                    value={weekend.end}
                    onChange={(e) => updateManualWeekend(index, 'end', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {manualWeekends.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeManualWeekend(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
                    aria-label="Remove weekend"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addManualWeekend}
              data-testid="add-weekend"
              className="flex items-center gap-2 px-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Date Range
            </button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-2">
          Attendees
        </label>
        <input
          type="text"
          id="attendees"
          name="attendees"
          value={attendeesInput}
          onChange={(e) => setAttendeesInput(e.target.value)}
          placeholder="e.g., John, Dave, Steve"
          className={inputClasses}
        />
        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Separate names with commas. Each person gets a unique voting link.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      >
        {isSubmitting ? (
          <>
            <Spinner className="w-5 h-5" />
            Creating...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Trip Poll
          </>
        )}
      </button>
    </form>
  );
}
