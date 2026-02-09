'use client';

import { useState } from 'react';
import { EventForm } from '@/components/EventForm';
import { copyToClipboard } from '@/lib/clipboard';

interface SuccessData {
  adminUrl: string;
  attendeeLinks: Array<{ name: string; url: string }>;
}

// Copy icon
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

// Check icon
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
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
      <main className="max-w-2xl mx-auto p-4 py-8">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Created!</h1>
          <p className="text-gray-500 mt-2">Share the links below to start collecting votes</p>
        </div>

        {/* Admin link card */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Your Admin Link</h2>
                <p className="text-xs text-gray-600">View all responses and manage invites</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <code
              data-testid="admin-link"
              className="block p-3 bg-gray-50 rounded-lg text-sm text-gray-700 break-all font-mono"
            >
              {successData.adminUrl}
            </code>
            <button
              onClick={() => handleCopy('admin', successData.adminUrl)}
              className={`
                mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium
                transition-all duration-150 active:scale-[0.98]
                ${copiedId === 'admin'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {copiedId === 'admin' ? (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="w-5 h-5" />
                  Copy Admin Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Attendee links */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" data-testid="attendee-links">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Individual Invite Links</h2>
            <p className="text-sm text-gray-500">Share each person&apos;s unique voting link</p>
          </div>
          <div className="divide-y divide-gray-100">
            {successData.attendeeLinks.map((link, index) => {
              const isCopied = copiedId === `attendee-${index}`;
              return (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                      {link.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{link.name}</p>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(`attendee-${index}`, link.url)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
                        transition-all duration-150 active:scale-95
                        ${isCopied
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {isCopied ? (
                        <>
                          <CheckIcon className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create another button */}
        <button
          onClick={() => setSuccessData(null)}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 font-medium bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Another Trip
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4 py-8">
      {/* Hero section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Bro Weekends</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Plan your group trip with simple yes/no/maybe voting
        </p>
        <p className="text-sm text-gray-400 mt-1">No login required</p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <EventForm onSuccess={setSuccessData} />
      </div>
    </main>
  );
}
