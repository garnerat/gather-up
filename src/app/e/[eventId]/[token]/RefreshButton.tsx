'use client';

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Refresh
    </button>
  );
}
