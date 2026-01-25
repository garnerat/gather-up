'use client';

import { useState } from 'react';
import { ResponseCell } from './ResponseCell';

type Value = 'yes' | 'no' | 'maybe' | null;

interface Weekend {
  start: string;
  end: string;
}

interface Attendee {
  id: string;
  name: string;
  responses: Record<string, string>;
}

interface Props {
  weekends: Weekend[];
  attendees: Attendee[];
  currentAttendeeId?: string;
  currentToken: string;
}

function formatWeekend(weekend: Weekend): string {
  const start = new Date(weekend.start);
  const end = new Date(weekend.end);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

export function ResponseGrid({ weekends, attendees, currentAttendeeId, currentToken }: Props) {
  const [responses, setResponses] = useState<Record<string, Record<string, Value>>>(() => {
    const initial: Record<string, Record<string, Value>> = {};
    attendees.forEach(a => {
      initial[a.id] = {};
      Object.entries(a.responses || {}).forEach(([key, value]) => {
        initial[a.id][key] = value as Value;
      });
    });
    return initial;
  });

  const [saving, setSaving] = useState(false);

  const handleResponseChange = async (attendeeId: string, weekendIndex: number, value: Value) => {
    if (attendeeId !== currentAttendeeId) return;

    // Optimistic update
    setResponses(prev => ({
      ...prev,
      [attendeeId]: {
        ...prev[attendeeId],
        [String(weekendIndex)]: value,
      },
    }));

    setSaving(true);
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: currentToken,
          weekendIndex,
          value,
        }),
      });

      if (!response.ok) {
        // Revert on error
        const attendee = attendees.find(a => a.id === attendeeId);
        if (attendee) {
          setResponses(prev => ({
            ...prev,
            [attendeeId]: {
              ...prev[attendeeId],
              [String(weekendIndex)]: (attendee.responses[String(weekendIndex)] as Value) || null,
            },
          }));
        }
      }
    } catch {
      // Revert on error
      const attendee = attendees.find(a => a.id === attendeeId);
      if (attendee) {
        setResponses(prev => ({
          ...prev,
          [attendeeId]: {
            ...prev[attendeeId],
            [String(weekendIndex)]: (attendee.responses[String(weekendIndex)] as Value) || null,
          },
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  // Calculate vote counts per weekend
  const voteCounts = weekends.map((_, index) => {
    let yes = 0, no = 0, maybe = 0;
    attendees.forEach(a => {
      const resp = responses[a.id]?.[String(index)];
      if (resp === 'yes') yes++;
      else if (resp === 'no') no++;
      else if (resp === 'maybe') maybe++;
    });
    return { yes, no, maybe };
  });

  return (
    <div className="overflow-x-auto">
      {saving && (
        <div className="text-sm text-gray-500 mb-2">Saving...</div>
      )}
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left border-b font-medium">Name</th>
            {weekends.map((weekend, index) => (
              <th key={index} className="p-2 text-center border-b font-medium min-w-[100px]">
                <div className="text-sm">{formatWeekend(weekend)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="text-green-600">{voteCounts[index].yes}✓</span>{' '}
                  <span className="text-yellow-600">{voteCounts[index].maybe}?</span>{' '}
                  <span className="text-red-600">{voteCounts[index].no}✗</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attendees.map(attendee => (
            <tr key={attendee.id} className={attendee.id === currentAttendeeId ? 'bg-blue-50' : ''}>
              <td className="p-2 border-b font-medium">
                {attendee.name}
                {attendee.id === currentAttendeeId && (
                  <span className="ml-2 text-xs text-blue-600">(you)</span>
                )}
              </td>
              {weekends.map((_, index) => (
                <td key={index} className="p-2 border-b text-center">
                  <ResponseCell
                    value={responses[attendee.id]?.[String(index)] || null}
                    onChange={
                      attendee.id === currentAttendeeId
                        ? (value) => handleResponseChange(attendee.id, index, value)
                        : undefined
                    }
                    disabled={attendee.id !== currentAttendeeId}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
