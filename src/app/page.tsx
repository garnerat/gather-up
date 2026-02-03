'use client';

import { useState } from 'react';
import { EventForm } from '@/components/EventForm';
import { copyToClipboard } from '@/lib/clipboard';

interface SuccessData {
  adminUrl: string;
  attendeeLinks: Array<{ name: string; url: string }>;
}

export default function Home() {
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (successData) {
    return (
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-green-600">Trip Created!</h1>

        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Your Admin Link</h2>
          <p className="text-sm text-gray-600 mb-2">
            Use this link to view all responses and share individual links:
          </p>
          <code
            data-testid="admin-link"
            className="block p-2 bg-white rounded border text-sm break-all"
          >
            {successData.adminUrl}
          </code>
          <button
            onClick={() => handleCopy('admin', successData.adminUrl)}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            {copiedId === 'admin' ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg" data-testid="attendee-links">
          <h2 className="font-bold text-lg mb-4">Individual Invite Links</h2>
          <p className="text-sm text-gray-600 mb-4">
            Share each person&apos;s unique link with them:
          </p>
          {successData.attendeeLinks.map((link, index) => (
            <div key={index} className="mb-4 p-3 bg-white rounded border">
              <div className="font-medium mb-1">{link.name}</div>
              <code className="block text-sm text-gray-600 break-all mb-2">
                {link.url}
              </code>
              <button
                onClick={() => handleCopy(`attendee-${index}`, link.url)}
                className="px-2 py-1 text-blue-600 text-sm border border-blue-300 rounded hover:bg-blue-50"
              >
                {copiedId === `attendee-${index}` ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setSuccessData(null)}
          className="mt-6 px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
        >
          Create Another Trip
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Bro Weekends Trip Planner</h1>
      <p className="text-gray-600 mb-6">
        Create a poll for your group trip. No login required!
      </p>
      <EventForm onSuccess={setSuccessData} />
    </main>
  );
}
