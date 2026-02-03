'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import type { AttendeeWithToken } from '@/types';

interface Props {
  eventId: string;
  attendees: Pick<AttendeeWithToken, 'id' | 'name' | 'token'>[];
}

export function InviteLinks({ eventId, attendees }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const handleCopy = async (id: string, url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded">
      <h2 className="font-bold mb-2">Invite Links</h2>
      {attendees.map(a => {
        const url = `${baseUrl}/e/${eventId}/${a.token}`;
        return (
          <div key={a.id} className="mb-2 flex items-center gap-2">
            <span className="font-medium">{a.name}:</span>
            <code className="text-sm bg-white px-2 py-1 rounded flex-1 truncate">
              {url}
            </code>
            <button
              onClick={() => handleCopy(a.id, url)}
              className="px-2 py-1 text-blue-600 text-sm border border-blue-300 rounded hover:bg-blue-50"
            >
              {copiedId === a.id ? 'Copied!' : 'Copy'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
