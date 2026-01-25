'use client';

interface Attendee {
  id: string;
  name: string;
  token: string;
}

interface Props {
  eventId: string;
  attendees: Attendee[];
}

export function InviteLinks({ eventId, attendees }: Props) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
              onClick={() => navigator.clipboard.writeText(url)}
              className="px-2 py-1 text-blue-600 text-sm border border-blue-300 rounded hover:bg-blue-50"
            >
              Copy
            </button>
          </div>
        );
      })}
    </div>
  );
}
