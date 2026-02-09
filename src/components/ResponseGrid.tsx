'use client';

import { useState } from 'react';
import { ResponseCell } from './ResponseCell';
import type { ResponseValue, Weekend, Attendee } from '@/types';

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

// Calculate consensus score: yes=1, maybe=0.5, no=0
function getConsensusScore(counts: { yes: number; maybe: number; no: number }, total: number): number {
  if (total === 0) return 0;
  return (counts.yes + counts.maybe * 0.5) / total;
}

// Get heat-map background class based on consensus
function getHeatMapClass(score: number, isBest: boolean): string {
  if (isBest) return 'bg-green-100 border-green-300';
  if (score >= 0.7) return 'bg-consensus-high';
  if (score >= 0.4) return 'bg-consensus-medium';
  return 'bg-consensus-low';
}

// Spinner component for saving state
function Spinner() {
  return (
    <svg className="animate-spin-fast h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function ResponseGrid({ weekends, attendees, currentAttendeeId, currentToken }: Props) {
  const [responses, setResponses] = useState<Record<string, Record<string, ResponseValue>>>(() => {
    const initial: Record<string, Record<string, ResponseValue>> = {};
    attendees.forEach(a => {
      initial[a.id] = {};
      Object.entries(a.responses || {}).forEach(([key, value]) => {
        initial[a.id][key] = value as ResponseValue;
      });
    });
    return initial;
  });

  const [saving, setSaving] = useState(false);

  const revertResponse = (attendeeId: string, weekendIndex: number) => {
    const attendee = attendees.find(a => a.id === attendeeId);
    if (attendee) {
      setResponses(prev => ({
        ...prev,
        [attendeeId]: {
          ...prev[attendeeId],
          [String(weekendIndex)]: (attendee.responses[String(weekendIndex)] as ResponseValue) || null,
        },
      }));
    }
  };

  const handleResponseChange = async (attendeeId: string, weekendIndex: number, value: ResponseValue) => {
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
        revertResponse(attendeeId, weekendIndex);
      }
    } catch {
      revertResponse(attendeeId, weekendIndex);
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

  // Calculate consensus scores and find best weekend
  const totalAttendees = attendees.length;
  const scores = voteCounts.map(counts => getConsensusScore(counts, totalAttendees));
  const maxScore = Math.max(...scores);
  const bestWeekendIndex = scores.indexOf(maxScore);
  const hasVotes = voteCounts.some(c => c.yes > 0 || c.maybe > 0 || c.no > 0);

  // Count total responses
  const totalResponses = attendees.filter(a => {
    return weekends.some((_, idx) => responses[a.id]?.[String(idx)] !== undefined && responses[a.id]?.[String(idx)] !== null);
  }).length;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {hasVotes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-xl">🏆</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Best option</p>
                <p className="font-semibold text-gray-900">
                  {formatWeekend(weekends[bestWeekendIndex])}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-vote-yes">{voteCounts[bestWeekendIndex].yes}</p>
                <p className="text-gray-500">available</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-vote-maybe">{voteCounts[bestWeekendIndex].maybe}</p>
                <p className="text-gray-500">maybe</p>
              </div>
              <div className="text-center px-3 py-1 bg-gray-100 rounded-full">
                <p className="text-sm text-gray-600">{totalResponses}/{totalAttendees} responded</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse-once">
          <Spinner />
          <span>Saving...</span>
        </div>
      )}

      {/* Voting Grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left border-b border-gray-200 font-medium text-gray-700">Name</th>
              {weekends.map((weekend, index) => {
                const isBest = hasVotes && index === bestWeekendIndex;
                const heatMapClass = hasVotes ? getHeatMapClass(scores[index], isBest) : '';
                return (
                  <th
                    key={index}
                    className={`p-3 text-center border-b border-gray-200 font-medium min-w-[120px] transition-colors duration-300 ${heatMapClass} ${isBest ? 'border-2 border-green-400' : ''}`}
                  >
                    <div className="text-sm text-gray-900 font-semibold">
                      {formatWeekend(weekend)}
                      {isBest && <span className="ml-1">🏆</span>}
                    </div>
                    <div className="flex justify-center gap-2 mt-1 text-xs">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                        {voteCounts[index].yes} ✓
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                        {voteCounts[index].maybe} ?
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        {voteCounts[index].no} ✗
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {attendees.map(attendee => {
              const isCurrentUser = attendee.id === currentAttendeeId;
              return (
                <tr
                  key={attendee.id}
                  className={`transition-colors duration-200 ${isCurrentUser ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                >
                  <td className="p-3 border-b border-gray-100 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{attendee.name}</span>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          you
                        </span>
                      )}
                    </div>
                  </td>
                  {weekends.map((_, index) => {
                    const isBest = hasVotes && index === bestWeekendIndex;
                    return (
                      <td
                        key={index}
                        className={`p-3 border-b border-gray-100 text-center ${isBest ? 'bg-green-50/50' : ''}`}
                      >
                        <div className="flex justify-center">
                          <ResponseCell
                            value={responses[attendee.id]?.[String(index)] || null}
                            onChange={
                              isCurrentUser
                                ? (value) => handleResponseChange(attendee.id, index, value)
                                : undefined
                            }
                            disabled={!isCurrentUser}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state hint for current user */}
      {currentAttendeeId && !hasVotes && (
        <p className="text-center text-gray-500 text-sm py-2">
          Tap a cell to vote: ✓ = Available, ? = Maybe, ✗ = Can&apos;t make it
        </p>
      )}
    </div>
  );
}
