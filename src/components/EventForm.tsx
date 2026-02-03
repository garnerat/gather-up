'use client';

import { useState } from 'react';
import type { Weekend } from '@/types';

interface EventFormProps {
  onSuccess: (data: {
    adminUrl: string;
    attendeeLinks: Array<{ name: string; url: string }>;
  }) => void;
}

export function EventForm({ onSuccess }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [hostName, setHostName] = useState('');
  const [weekends, setWeekends] = useState<Weekend[]>([{ start: '', end: '' }]);
  const [attendeesInput, setAttendeesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addWeekend = () => {
    setWeekends([...weekends, { start: '', end: '' }]);
  };

  const removeWeekend = (index: number) => {
    if (weekends.length > 1) {
      setWeekends(weekends.filter((_, i) => i !== index));
    }
  };

  const updateWeekend = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...weekends];
    updated[index][field] = value;
    setWeekends(updated);
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

    const validWeekends = weekends.filter((w) => w.start && w.end);
    if (validWeekends.length === 0) {
      setError('Please add at least one weekend with both start and end dates');
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
          weekends: validWeekends,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="hostName" className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Weekend Options
        </label>
        {weekends.map((weekend, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <input
              type="date"
              name={`weekend-${index}-start`}
              value={weekend.start}
              onChange={(e) => updateWeekend(index, 'start', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              name={`weekend-${index}-end`}
              value={weekend.end}
              onChange={(e) => updateWeekend(index, 'end', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {weekends.length > 1 && (
              <button
                type="button"
                onClick={() => removeWeekend(index)}
                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addWeekend}
          data-testid="add-weekend"
          className="mt-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded border border-blue-300"
        >
          + Add Weekend
        </button>
      </div>

      <div>
        <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-1">
          Attendees (comma-separated)
        </label>
        <input
          type="text"
          id="attendees"
          name="attendees"
          value={attendeesInput}
          onChange={(e) => setAttendeesInput(e.target.value)}
          placeholder="e.g., John, Dave, Steve"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Each person will get their own unique voting link
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Trip Poll'}
      </button>
    </form>
  );
}
