import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto p-4 text-center mt-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Event Not Found</h1>
      <p className="text-gray-600 mb-8">
        This event doesn&apos;t exist or the link is invalid.
        Please check that you have the correct URL.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Create a New Trip
      </Link>
    </main>
  );
}
